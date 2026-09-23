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
        careerGoal: { 
          include: { 
            skills: { 
              include: { skill: true } 
            } 
          } 
        },
        skills: true
      }
    });

    const gapMap = {};
    students.forEach(student => {
      if (!student.careerGoal || !student.careerGoal.skills) return;
      student.careerGoal.skills.forEach(rs => {
        if (!rs.skill) return;
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
    console.error('getStudentGaps error:', error);
    res.status(500).json({ message: 'Analytics error', error: error.message });
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

const getRecruiterAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const company = await prisma.company.findFirst({
      where: { userId }
    });

    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const opportunities = await prisma.opportunity.findMany({
      where: { companyId: company.id },
      include: {
        skills: { include: { skill: true } },
        applications: {
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true, email: true } },
                skills: { include: { skill: true } }
              }
            }
          }
        }
      }
    });

    const totalPostings = opportunities.length;
    const internshipCount = opportunities.filter(o => o.type === 'INTERNSHIP').length;
    const jobCount = opportunities.filter(o => o.type === 'JOB').length;
    const apprenticeshipCount = opportunities.filter(o => o.type === 'APPRENTICESHIP').length;

    let totalApplicants = 0;
    const funnel = {
      APPLIED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0
    };

    let totalMatchSum = 0;
    let scoredApplicantCount = 0;
    const postingsOverview = [];
    const skillDemandCount = {};

    for (const opp of opportunities) {
      const oppApps = opp.applications;
      totalApplicants += oppApps.length;

      opp.skills.forEach(os => {
        skillDemandCount[os.skill.name] = (skillDemandCount[os.skill.name] || 0) + 1;
      });

      let oppMatchSum = 0;
      let oppShortlisted = 0;

      for (const app of oppApps) {
        if (funnel[app.status] !== undefined) {
          funnel[app.status]++;
        }
        if (app.status === 'SHORTLISTED' || app.status === 'SELECTED' || app.status === 'INTERVIEW') {
          oppShortlisted++;
        }

        const reqSkills = opp.skills;
        if (reqSkills.length > 0) {
          const studentSkillMap = new Map(app.student.skills.map(ss => [ss.skillId, ss.score]));
          let matchScore = 0;
          reqSkills.forEach(rs => {
            const studentScore = studentSkillMap.get(rs.skillId) || 0;
            if (studentScore >= rs.minRequiredScore) {
              matchScore += 1;
            } else if (studentScore > 0) {
              matchScore += (studentScore / rs.minRequiredScore);
            }
          });
          const pct = Math.round((matchScore / reqSkills.length) * 100);
          totalMatchSum += pct;
          scoredApplicantCount++;
          oppMatchSum += pct;
        }
      }

      postingsOverview.push({
        id: opp.id,
        title: opp.title,
        type: opp.type,
        applicantCount: oppApps.length,
        shortlistedCount: oppShortlisted,
        avgMatchScore: oppApps.length > 0 ? Math.round(oppMatchSum / oppApps.length) : 0,
        deadline: opp.deadline
      });
    }

    const avgApplicantMatch = scoredApplicantCount > 0 ? Math.round(totalMatchSum / scoredApplicantCount) : 0;
    const topRequiredSkills = Object.entries(skillDemandCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      company: {
        id: company.id,
        name: company.name,
        isVerified: company.isVerified
      },
      metrics: {
        totalPostings,
        internshipCount,
        jobCount,
        apprenticeshipCount,
        totalApplicants,
        shortlistedCount: funnel.SHORTLISTED + funnel.INTERVIEW + funnel.SELECTED,
        selectedCount: funnel.SELECTED,
        avgApplicantMatch
      },
      funnel: Object.entries(funnel).map(([status, count]) => ({ status, count })),
      postingsOverview,
      topRequiredSkills
    });
  } catch (error) {
    console.error('Recruiter analytics error:', error);
    res.status(500).json({ message: 'Recruiter analytics error', error: error.message });
  }
};

module.exports = { 
  getInstitutionOverview, 
  getIndustryDemand, 
  getStudentGaps, 
  getPlacementFunnel,
  getRecruiterAnalytics 
};
