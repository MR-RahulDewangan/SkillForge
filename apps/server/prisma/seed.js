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
    await prisma.student.update({ 
      where: { id: p.id }, 
      data: { 
        careerGoalId: dataAnalyst.id,
        degree: 'B.Tech',
        branch: 'Computer Science',
        cgpa: 8.4,
        gradYear: 2026
      } 
    });
  }

  // 6. Assessment Questions
  const questionsData = [
    {
      skillId: createdSkills[0].id, // SQL
      questionText: 'Which clause is used in SQL to filter grouping results created by GROUP BY?',
      options: ['WHERE', 'HAVING', 'ORDER BY', 'FILTER'],
      correctOption: 1,
      difficulty: 2
    },
    {
      skillId: createdSkills[0].id,
      questionText: 'What is the primary function of a LEFT JOIN in SQL?',
      options: [
        'Returns rows only when there is a match in both tables',
        'Returns all rows from the right table and matching rows from the left table',
        'Returns all rows from the left table and matching rows from the right table',
        'Deletes duplicate rows from the left table'
      ],
      correctOption: 2,
      difficulty: 1
    },
    {
      skillId: createdSkills[1].id, // Python
      questionText: 'Which of the following built-in Python data types is immutable?',
      options: ['List', 'Dictionary', 'Set', 'Tuple'],
      correctOption: 3,
      difficulty: 1
    },
    {
      skillId: createdSkills[1].id,
      questionText: 'In Python, what is the output of bool([])?',
      options: ['True', 'False', 'None', 'Error'],
      correctOption: 1,
      difficulty: 1
    },
    {
      skillId: createdSkills[2].id, // Power BI
      questionText: 'What expression language is primarily used in Power BI for calculated columns and measures?',
      options: ['M Query', 'DAX', 'SQL', 'VBA'],
      correctOption: 1,
      difficulty: 2
    },
    {
      skillId: createdSkills[3].id, // Statistics
      questionText: 'What statistical measure indicates the spread of data points around the mean?',
      options: ['Median', 'Standard Deviation', 'Mode', 'Range'],
      correctOption: 1,
      difficulty: 1
    },
    {
      skillId: createdSkills[4].id, // Communication
      questionText: 'What is a core principle of active listening in collaborative work environments?',
      options: [
        'Formulating your rebuttal while the other person is speaking',
        'Paraphrasing key points to confirm understanding before responding',
        'Interrupting to show engagement',
        'Remaining completely silent without physical or verbal cues'
      ],
      correctOption: 1,
      difficulty: 1
    }
  ];

  for (const q of questionsData) {
    const existing = await prisma.assessmentQuestion.findFirst({
      where: { questionText: q.questionText }
    });
    if (!existing) {
      await prisma.assessmentQuestion.create({ data: q });
    }
  }

  // 7. Industry Partner & Company
  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@innovatetech.com' },
    update: {},
    create: {
      email: 'recruiter@innovatetech.com',
      password,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: 'INDUSTRY'
    }
  });

  const company = await prisma.company.upsert({
    where: { userId: recruiterUser.id },
    update: {},
    create: {
      userId: recruiterUser.id,
      name: 'InnovateTech Analytics',
      industry: 'Data & Artificial Intelligence',
      website: 'https://innovatetech.example.com',
      description: 'Leading provider of enterprise analytics and AI solutions.',
      isVerified: true,
      location: 'Bangalore, India'
    }
  });

  // 8. Opportunities
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 30);

  const existingOpp = await prisma.opportunity.findFirst({
    where: { title: 'Junior Data Analyst Intern', companyId: company.id }
  });

  let opportunity = existingOpp;
  if (!opportunity) {
    opportunity = await prisma.opportunity.create({
      data: {
        companyId: company.id,
        type: 'INTERNSHIP',
        title: 'Junior Data Analyst Intern',
        description: 'Join our data intelligence team to build real-time dashboards, perform SQL transformations, and uncover predictive business insights.',
        location: 'Bangalore / Hybrid',
        workMode: 'HYBRID',
        stipend: 25000,
        minCgpa: 7.0,
        requiredDegree: 'B.Tech',
        requiredBranch: 'Computer Science',
        graduationYear: 2026,
        deadline: deadlineDate,
        skills: {
          create: [
            { skillId: createdSkills[0].id, minRequiredScore: 70 }, // SQL
            { skillId: createdSkills[1].id, minRequiredScore: 75 }, // Python
            { skillId: createdSkills[2].id, minRequiredScore: 65 }  // Power BI
          ]
        }
      }
    });
  }

  // 9. Sample Application (Student 1 applied to Opportunity)
  await prisma.application.upsert({
    where: {
      studentId_opportunityId: {
        studentId: studentProfiles[0].id,
        opportunityId: opportunity.id
      }
    },
    update: {},
    create: {
      studentId: studentProfiles[0].id,
      opportunityId: opportunity.id,
      status: 'UNDER_REVIEW'
    }
  });

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
