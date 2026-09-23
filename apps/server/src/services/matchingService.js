const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Deterministic matching algorithm for Students and Opportunities
 * 
 * Formula:
 * Final Score = (0.70 * SkillMatch) + (0.20 * EligibilityScore) + (0.10 * InterestScore)
 */
const calculateMatch = async (studentId, opportunityId) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      skills: { include: { skill: true } },
      careerGoal: true,
      user: true
    }
  });

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      skills: { include: { skill: true } },
      company: true
    }
  });

  if (!student || !opportunity) throw new Error('Student or Opportunity not found');

  // 1. Skill Match Calculation (70%)
  const requiredSkills = opportunity.skills;
  const studentSkillsMap = new Map(student.skills.map(ss => [ss.skillId, ss.score]));
  
  let skillMatchSum = 0;
  const matchingSkills = [];
  const missingSkills = [];
  const skillGaps = [];

  requiredSkills.forEach(rs => {
    const studentScore = studentSkillsMap.get(rs.skillId) || 0;
    const requiredScore = rs.minRequiredScore;
    
    if (studentScore >= requiredScore) {
      matchingSkills.push(rs.skill.name);
      skillMatchSum += 1; // Fully satisfied
    } else if (studentScore > 0) {
      matchingSkills.push(rs.skill.name);
      skillMatchSum += (studentScore / requiredScore); // Partially satisfied
      skillGaps.push({
        skill: rs.skill.name,
        gap: requiredScore - studentScore
      });
    } else {
      missingSkills.push(rs.skill.name);
      skillGaps.push({
        skill: rs.skill.name,
        gap: requiredScore
      });
    }
  });

  const skillMatchScore = requiredSkills.length > 0 
    ? (skillMatchSum / requiredSkills.length) * 100 
    : 100;

  // 2. Eligibility Score Calculation (20%)
  // Eligibility is a binary check for critical filters, but we can weigh them
  let eligibilityScore = 100;
  const eligibilityIssues = [];

  if (opportunity.minCgpa && (!student.cgpa || student.cgpa < opportunity.minCgpa)) {
    eligibilityScore = 0;
    eligibilityIssues.push(`CGPA below required ${opportunity.minCgpa}`);
  }
  if (opportunity.requiredDegree && student.degree !== opportunity.requiredDegree) {
    eligibilityScore = 0;
    eligibilityIssues.push(`Degree ${opportunity.requiredDegree} required`);
  }
  if (opportunity.requiredBranch && student.branch !== opportunity.requiredBranch) {
    eligibilityScore = 0;
    eligibilityIssues.push(`Branch ${opportunity.requiredBranch} required`);
  }
  if (opportunity.graduationYear && student.gradYear !== opportunity.graduationYear) {
    eligibilityScore = 0;
    eligibilityIssues.push(`Graduation year ${opportunity.graduationYear} required`);
  }

  // 3. Career Interest Score (10%)
  // Match if the opportunity's required skills overlap with student's career goal skills
  let interestScore = 0;
  if (student.careerGoalId) {
    const goalSkills = await prisma.careerRoleSkill.findMany({
      where: { careerRoleId: student.careerGoalId }
    });
    const goalSkillIds = new Set(goalSkills.map(gs => gs.skillId));
    const oppSkillIds = new Set(requiredSkills.map(rs => rs.skillId));
    
    const intersection = new Set([...goalSkillIds].filter(x => oppSkillIds.has(x)));
    interestScore = goalSkillIds.size > 0 
      ? (intersection.size / goalSkillIds.size) * 100 
      : 0;
  }

  // Final Weighted Calculation
  const overallMatch = (0.70 * skillMatchScore) + (0.20 * eligibilityScore) + (0.10 * interestScore);

  return {
    overallMatch: Math.round(overallMatch),
    skillMatch: Math.round(skillMatchScore),
    eligibilityScore: Math.round(eligibilityScore),
    interestScore: Math.round(interestScore),
    matchingSkills,
    missingSkills,
    skillGaps,
    eligibilityIssues
  };
};

const getRecommendedOpportunities = async (studentId) => {
  const allOpportunities = await prisma.opportunity.findMany({
    include: { company: true }
  });

  const recommendations = await Promise.all(
    allOpportunities.map(async (opp) => {
      const match = await calculateMatch(studentId, opp.id);
      return { ...opp, match };
    })
  );

  return recommendations.sort((a, b) => b.match.overallMatch - a.match.overallMatch);
};

const getRecommendedCandidates = async (opportunityId) => {
  const students = await prisma.student.findMany();
  
  const candidates = await Promise.all(
    students.map(async (student) => {
      const match = await calculateMatch(student.id, opportunityId);
      return { 
        studentId: student.id, 
        student: student.user, 
        match 
      };
    })
  );

  return candidates.sort((a, b) => b.match.overallMatch - a.match.overallMatch);
};

module.exports = { calculateMatch, getRecommendedOpportunities, getRecommendedCandidates };
