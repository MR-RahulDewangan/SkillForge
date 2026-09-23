require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAll() {
  console.log('--- STARTING COMPREHENSIVE REFERENTIAL INTEGRITY & COUNT VERIFICATION ---');

  // 1. Counts
  const skillsCount = await prisma.skill.count();
  const careerRolesCount = await prisma.careerRole.count();
  const careerSkillsCount = await prisma.careerSkill.count();
  const assessmentQuestionsCount = await prisma.assessmentQuestion.count();
  const learningResourcesCount = await prisma.learningResource.count();
  const companiesCount = await prisma.company.count();
  const opportunitiesCount = await prisma.opportunity.count();
  const studentsCount = await prisma.student.count();
  const applicationsCount = await prisma.application.count();

  console.log('\nEntity Record Counts:');
  console.log(`  Skills: ${skillsCount}`);
  console.log(`  Career Roles: ${careerRolesCount}`);
  console.log(`  Career Skills: ${careerSkillsCount}`);
  console.log(`  Assessment Questions: ${assessmentQuestionsCount}`);
  console.log(`  Learning Resources: ${learningResourcesCount}`);
  console.log(`  Companies: ${companiesCount}`);
  console.log(`  Opportunities: ${opportunitiesCount}`);
  console.log(`  Students: ${studentsCount}`);
  console.log(`  Applications: ${applicationsCount}`);

  // 2. Career Skills referential integrity
  const careerSkills = await prisma.careerSkill.findMany({
    include: { skill: true, careerRole: true }
  });
  const invalidCareerSkills = careerSkills.filter(cs => !cs.skill || !cs.careerRole);
  console.log(`\n• Career skills validity check: ${careerSkills.length} total, ${invalidCareerSkills.length} invalid.`);

  // 3. Assessment Questions referential integrity
  const questions = await prisma.assessmentQuestion.findMany({
    include: { skill: true }
  });
  const invalidQuestions = questions.filter(q => !q.skill);
  console.log(`• Assessment questions validity check: ${questions.length} total, ${invalidQuestions.length} invalid.`);

  // 4. Learning Resources referential integrity
  const resources = await prisma.learningResource.findMany({
    include: { skill: true }
  });
  const invalidResources = resources.filter(r => !r.skill);
  console.log(`• Learning resources validity check: ${resources.length} total, ${invalidResources.length} invalid.`);

  // 5. Opportunities referential integrity
  const opportunities = await prisma.opportunity.findMany({
    include: { company: true }
  });
  const invalidOpps = opportunities.filter(o => !o.company);
  console.log(`• Opportunities validity check: ${opportunities.length} total, ${invalidOpps.length} invalid.`);

  // 6. Applications referential integrity
  const applications = await prisma.application.findMany({
    include: { student: true, opportunity: true }
  });
  const invalidApps = applications.filter(a => !a.student || !a.opportunity);
  console.log(`• Applications validity check: ${applications.length} total, ${invalidApps.length} invalid.`);

  // 7. Verify CSV-specific records exist
  const csvStudents = await prisma.student.findMany({
    where: { id: { in: ['STU001', 'STU002', 'STU003', 'STU004', 'STU005', 'STU006'] } }
  });
  console.log(`\n• Specific CSV Students loaded: ${csvStudents.length}/6`);

  const csvCompanies = await prisma.company.findMany({
    where: { id: { in: ['COMP001', 'COMP002', 'COMP003', 'COMP004'] } }
  });
  console.log(`• Specific CSV Companies loaded: ${csvCompanies.length}/4`);

  const csvOpportunities = await prisma.opportunity.findMany({
    where: { id: { in: ['OPP001', 'OPP002', 'OPP003', 'OPP004', 'OPP005', 'OPP006'] } }
  });
  console.log(`• Specific CSV Opportunities loaded: ${csvOpportunities.length}/6`);

  const csvApplications = await prisma.application.findMany({
    where: { id: { in: ['APP001', 'APP002', 'APP003', 'APP004', 'APP005', 'APP006'] } }
  });
  console.log(`• Specific CSV Applications loaded: ${csvApplications.length}/6`);

  const isAllValid = 
    invalidCareerSkills.length === 0 &&
    invalidQuestions.length === 0 &&
    invalidResources.length === 0 &&
    invalidOpps.length === 0 &&
    invalidApps.length === 0 &&
    csvStudents.length === 6 &&
    csvCompanies.length === 4 &&
    csvOpportunities.length === 6 &&
    csvApplications.length === 6;

  console.log(`\nFINAL INTEGRITY STATUS: ${isAllValid ? 'PASSED (100% RELATIONAL INTEGRITY)' : 'FAILED'}`);
}

verifyAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
