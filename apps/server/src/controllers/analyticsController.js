const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getInstitutionOverview = async (req, res) => {
  try {
    // 1. Basic Counts
    const totalStudents = await prisma.student.count();
    const assessedStudents = await prisma.student.count({
      where: {
        skills: { some: {} }
      }
    });
    
    const totalApplications = await prisma.application.count();
    const shortlistedCount = await prisma.application.count({ where: { status: 'SHORTLISTED' } });
    const selectedCount = await prisma.application.count({ where: { status: 'SELECTED' } });
    const internshipCount = await prisma.opportunity.count({ where: { type: 'INTERNSHIP' } });
    const companyCount = await prisma.company.count();

    // 2. Average Skill Score
    const allStudentSkills = await prisma.studentSkill.findMany();
    const avgScore = allStudentSkills.length > 0 
      ? Math.round(allStudentSkills.reduce((acc, curr) => acc + curr.score, 0) / allStudentSkills.length)
      : 0;

    // 3. Placement-Ready Students
    // Defined as students who satisfy at least one CareerRole's requirements fully
    const roles = await prisma.careerRole.findMany({ include: { skills: true } });
    const students = await prisma.student.findMany({ include: { skills: true } });
    
    let readyCount = 0;
    students.forEach(student => {
      const isReady = roles.some(role => {
        return role.skills.every(rs => {
          const sSkill = student.skills.find(ss => ss.skillId === rs.skillId);
          return sSkill && sSkill.score >= rs.minRequiredScore;
        });
      });
      if (isReady) readyCount++;
    });

    res.json({
      metrics: {
        totalStudents,
        assessedStudents,
        avgScore,
        readyCount,
        totalApplications,
        shortlistedCount,
        selectedCount,
        internshipCount,
        companyCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Analytics error', error: error.message });
  }
};

const getIndustryDemand = async (req, res) => {
  try {
    // Get skills requested by companies in opportunities
    const oppSkills = await prisma.opportunitySkill.findMany({
      include: { skill: true }
    });

    const demandMap = {};
    oppSkills.forEach(os => {
      demandMap[os.skill.name] = (demandMap[os.skill.name] || 0) + 1;
    });

    const sortedDemand = Object.entries(demandMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json(sortedDemand);
  } catch (error) {
    res.status(500).json({ message: 'Analytics error' });
  }
};

const getStudentGaps = async (req, res) => {
  try {
    // Calculate average gap per skill across all students for their chosen goals
    const students = await prisma.student.findMany({
      include: {
        careerGoal: { include: { skills: true } },
        skills: true
      }
    });

    const gapMap = {};
    students.forEach(student => {
      if (!student.careerGoal) return;
      student.careerGoal.skills.forEach(rs => {
        const sSkill = student.skills.find(ss => ss.skillId === rs.skillId);
        const score = sSkill ? sSkill.score : 0;
        const gap = Math.max(0, rs.minRequiredScore - score);
        
        gapMap[rs.skill.name] = (gapMap[rs.skill.name] || 0) + gap;
      });
    });

    const totalStudentsWithGoals = students.filter(s => s.careerGoal).length;
    const avgGaps = Object.entries(gapMap)
      .map(([name, totalGap]) => ({ 
        name, 
        avgGap: Math.round(totalGap / (totalStudentsWithGoals || 1)) 
      }))
      .sort((a, b) => b.avgGap - a.avgGap);

    res.json(avgGaps);
  } catch (error) {
    res.status(500).json({ message: 'Analytics error' });
  }
};

const getPlacementFunnel = async (req, res) => {
  try {
    const stages = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];
    const counts = {};
    
    for (const stage of stages) {
      counts[stage] = await prisma.application.count({ where: { status: stage } });
    }
    
    res.json(Object.entries(counts).map(([stage, count]) => ({ stage, count })));
  } catch (error) {
    res.status(500).json({ message: 'Analytics error' });
  }
};

module.exports = { getInstitutionOverview, getIndustryDemand, getStudentGaps, getPlacementFunnel };
