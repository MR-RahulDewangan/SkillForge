const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@institution.edu' },
    update: {},
    create: { email: 'admin@institution.edu', password, firstName: 'Admin', lastName: 'User', role: 'INSTITUTION_ADMIN' },
  });

  const studentsData = [
    { email: 'student1@university.edu', firstName: 'Alice', lastName: 'One' },
    { email: 'student2@university.edu', firstName: 'Bob', lastName: 'Two' },
    { email: 'student3@university.edu', firstName: 'Charlie', lastName: 'Three' },
    { email: 'student4@university.edu', firstName: 'Diana', lastName: 'Four' },
    { email: 'student5@university.edu', firstName: 'Ethan', lastName: 'Five' },
  ];

  const studentProfiles = [];
  for (const s of studentsData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { email: s.email, password, firstName: s.firstName, lastName: s.lastName, role: 'STUDENT' },
    });
    const profile = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
    studentProfiles.push(profile);
  }

  const skillNames = ['SQL', 'Python', 'Power BI', 'Statistics', 'Communication'];
  const createdSkills = [];
  for (const name of skillNames) {
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name, category: 'Technical' },
    });
    createdSkills.push(skill);
  }

  const dataAnalyst = await prisma.careerRole.upsert({
    where: { title: 'Data Analyst' },
    update: {},
    create: { title: 'Data Analyst', description: 'Analyze data to provide business insights' },
  });

  for (const skill of createdSkills) {
    await prisma.careerRoleSkill.upsert({
      where: { careerRoleId_skillId: { careerRoleId: dataAnalyst.id, skillId: skill.id } },
      update: {},
      create: { careerRoleId: dataAnalyst.id, skillId: skill.id, minRequiredScore: 75 },
    });
  }

  const courses = [
    { title: 'Advanced SQL Mastery', provider: 'Coursera', skillId: createdSkills[0].id, url: 'http://coursera.org/sql' },
    { title: 'Python for Data Science', provider: 'Udemy', skillId: createdSkills[1].id, url: 'http://udemy.com/python' },
    { title: 'Power BI Dashboarding', provider: 'Microsoft', skillId: createdSkills[2].id, url: 'http://ms.com/pbi' },
    { title: 'Practical Statistics', provider: 'Khan Academy', skillId: createdSkills[3].id, url: 'http://khan.org/stats' },
    { title: 'Professional Communication', provider: 'LinkedIn Learning', skillId: createdSkills[4].id, url: 'http://linkedin.com/comm' },
  ];

  for (const c of courses) {
    await prisma.course.create({ data: c });
  }

  const profiles = studentProfiles;
  const skillIds = createdSkills.map(s => s.id);

  await prisma.studentSkill.createMany({
    data: [
      { studentId: profiles[0].id, skillId: skillIds[0], score: 90 },
      { studentId: profiles[0].id, skillId: skillIds[1], score: 85 },
      { studentId: profiles[0].id, skillId: skillIds[2], score: 80 },
      { studentId: profiles[0].id, skillId: skillIds[3], score: 78 },
      { studentId: profiles[0].id, skillId: skillIds[4], score: 70 },
    ]
  });

  await prisma.studentSkill.createMany({
    data: [
      { studentId: profiles[1].id, skillId: skillIds[0], score: 70 },
      { studentId: profiles[1].id, skillId: skillIds[1], score: 60 },
      { studentId: profiles[1].id, skillId: skillIds[2], score: 90 },
      { studentId: profiles[1].id, skillId: skillIds[3], score: 50 },
      { studentId: profiles[1].id, skillId: skillIds[4], score: 80 },
    ]
  });

  await prisma.studentSkill.createMany({
    data: [
      { studentId: profiles[2].id, skillId: skillIds[0], score: 30 },
      { studentId: profiles[2].id, skillId: skillIds[1], score: 40 },
      { studentId: profiles[2].id, skillId: skillIds[2], score: 20 },
      { studentId: profiles[2].id, skillId: skillIds[3], score: 10 },
      { studentId: profiles[2].id, skillId: skillIds[4], score: 50 },
    ]
  });

  for (const p of profiles) {
    await prisma.student.update({ where: { id: p.id }, data: { careerGoalId: dataAnalyst.id } });
  }

  console.log('Seed data completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
