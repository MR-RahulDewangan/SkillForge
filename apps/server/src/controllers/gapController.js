const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const analyzeSkillGap = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Get Student Profile and Career Goal
    const student = await prisma.student.findFirst({
      where: { userId },
      include: {
        careerGoal: {
          include: {
            skills: {
              include: { skill: true }
            }
          }
        },
        skills: {
          include: { skill: true }
        }
      }
    });

    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    if (!student.careerGoal) return res.status(400).json({ message: 'Please select a career goal first' });

    const requiredSkills = student.careerGoal.skills;
    const studentSkillsMap = new Map(
      student.skills.map(ss => [ss.skillId, ss.score])
    );

    const gapAnalysis = [];
    let totalScoreRatio = 0;

    // 2. Calculate gaps deterministically
    for (const rs of requiredSkills) {
      const studentScore = studentSkillsMap.get(rs.skillId) || 0;
      const requiredScore = rs.minRequiredScore;
      const gap = requiredScore - studentScore;
      
      let status = 'SATISFIED';
      let severity = null;

      if (gap > 0) {
        status = 'GAP';
        if (gap <= 10) severity = 'MINOR';
        else if (gap <= 25) severity = 'MODERATE';
        else severity = 'CRITICAL';
      }

      gapAnalysis.push({
        skillName: rs.skill.name,
        studentScore,
        requiredScore,
        gap: Math.max(0, gap),
        status,
        severity
      });

      totalScoreRatio += Math.min(studentScore, requiredScore) / requiredScore;
    }

    const readiness = requiredSkills.length > 0 
      ? Math.round((totalScoreRatio / requiredSkills.length) * 100) 
      : 100;

    // 3. Fetch Learning Recommendations
    const recommendations = [];
    for (const item of gapAnalysis) {
      if (item.status === 'GAP') {
        const skill = await prisma.skill.findFirst({
          where: { name: item.skillName }
        });
        if (skill) {
          const courses = await prisma.course.findMany({
            where: { skillId: skill.id }
          });
          courses.forEach(c => {
            recommendations.push({
              skillName: item.skillName,
              severity: item.severity,
              course: c
            });
          });
        }
      }
    }

    res.json({
      readiness,
      gapAnalysis,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { analyzeSkillGap };
