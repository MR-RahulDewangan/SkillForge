const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper to locate the root data directory
function findDataDir() {
  const candidates = [
    path.resolve(__dirname, '../../../data'), // from apps/server/prisma
    path.resolve(__dirname, '../../data'),
    path.resolve(__dirname, '../data'),
    path.resolve(process.cwd(), 'data'),
    path.resolve(process.cwd(), '../data'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'skills.csv'))) {
      return dir;
    }
  }
  throw new Error(`Data directory not found. Candidates checked:\n${candidates.join('\n')}`);
}

// Helper to parse a CSV file into array of trimmed objects
function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`CSV file not found: ${filePath}`));
    }
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (raw) => {
        const clean = {};
        for (const [key, val] of Object.entries(raw)) {
          const trimmedKey = key.trim();
          const trimmedVal = typeof val === 'string' ? val.trim() : val;
          clean[trimmedKey] = trimmedVal === '' ? null : trimmedVal;
        }
        results.push(clean);
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// Convert difficulty string to number
function difficultyToNumber(diff) {
  if (!diff) return 1;
  const upper = diff.toUpperCase();
  if (upper === 'BEGINNER') return 1;
  if (upper === 'INTERMEDIATE') return 2;
  if (upper === 'ADVANCED') return 3;
  const parsed = parseInt(diff, 10);
  return isNaN(parsed) ? 1 : parsed;
}

async function main() {
  const dataDir = findDataDir();
  console.log(`[SEED] Using CSV data directory: ${dataDir}`);

  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  const orphanReports = [];

  // Create PostgreSQL compatibility views if not present
  try {
    await prisma.$executeRawUnsafe('CREATE OR REPLACE VIEW "CareerSkill" AS SELECT * FROM "CareerRoleSkill"');
    await prisma.$executeRawUnsafe('CREATE OR REPLACE VIEW "LearningResource" AS SELECT * FROM "Course"');
  } catch (vErr) {
    console.warn('[SEED] Note on view creation:', vErr.message);
  }

  // 0. Seed or Ensure Baseline Admin & Faculty Accounts
  console.log('\n[0/9] Ensuring system baseline accounts (Admin & Faculty)...');
  await prisma.user.upsert({
    where: { email: 'admin@institution.edu' },
    update: {},
    create: {
      email: 'admin@institution.edu',
      password: defaultPasswordHash,
      firstName: 'Admin',
      lastName: 'Institution',
      role: 'INSTITUTION_ADMIN'
    }
  });

  await prisma.user.upsert({
    where: { email: 'faculty1@university.edu' },
    update: {},
    create: {
      email: 'faculty1@university.edu',
      password: defaultPasswordHash,
      firstName: 'Prof.',
      lastName: 'Sharma',
      role: 'FACULTY'
    }
  });

  // Clean up legacy non-standard demo skills/records if they collide with new canonical IDs
  console.log('[PRE-SEED] Checking for legacy non-CSV records to prevent unique constraints...');
  const legacySkills = await prisma.skill.findMany();
  for (const s of legacySkills) {
    if (!s.id.startsWith('SK')) {
      // It's a legacy UUID record
      // Clean dependent relations first
      await prisma.studentSkill.deleteMany({ where: { skillId: s.id } }).catch(() => {});
      await prisma.opportunitySkill.deleteMany({ where: { skillId: s.id } }).catch(() => {});
      await prisma.careerSkill.deleteMany({ where: { skillId: s.id } }).catch(() => {});
      await prisma.assessmentQuestion.deleteMany({ where: { skillId: s.id } }).catch(() => {});
      await prisma.assessmentAttempt.deleteMany({ where: { skillId: s.id } }).catch(() => {});
      await prisma.learningResource.deleteMany({ where: { skillId: s.id } }).catch(() => {});
      await prisma.skill.delete({ where: { id: s.id } }).catch(() => {});
    }
  }

  const legacyRoles = await prisma.careerRole.findMany();
  for (const r of legacyRoles) {
    if (!r.id.startsWith('CAREER')) {
      await prisma.careerSkill.deleteMany({ where: { careerRoleId: r.id } }).catch(() => {});
      await prisma.student.updateMany({ where: { careerGoalId: r.id }, data: { careerGoalId: null } }).catch(() => {});
      await prisma.careerRole.delete({ where: { id: r.id } }).catch(() => {});
    }
  }

  // =========================================================================
  // 1. SKILLS (skills.csv)
  // =========================================================================
  console.log('\n[1/9] Seeding skills from skills.csv...');
  const skillsData = await parseCsvFile(path.join(dataDir, 'skills.csv'));
  const validSkillIds = new Set();

  for (const row of skillsData) {
    const { skill_id, skill_name, category, sub_category, description, status } = row;
    if (!skill_id || !skill_name) {
      orphanReports.push({ file: 'skills.csv', issue: 'Missing skill_id or skill_name', row });
      continue;
    }
    await prisma.skill.upsert({
      where: { id: skill_id },
      update: {
        name: skill_name,
        category: category || 'Technical',
        subCategory: sub_category,
        description,
        status: status || 'ACTIVE'
      },
      create: {
        id: skill_id,
        name: skill_name,
        category: category || 'Technical',
        subCategory: sub_category,
        description,
        status: status || 'ACTIVE'
      }
    });
    validSkillIds.add(skill_id);
  }
  console.log(`✓ Seeded ${validSkillIds.size} skills.`);

  // =========================================================================
  // 2. CAREER ROLES (career_roles.csv)
  // =========================================================================
  console.log('\n[2/9] Seeding career roles from career_roles.csv...');
  const rolesData = await parseCsvFile(path.join(dataDir, 'career_roles.csv'));
  const validRoleIds = new Set();

  for (const row of rolesData) {
    const { career_id, career_name, description, industry_category, status } = row;
    if (!career_id || !career_name) {
      orphanReports.push({ file: 'career_roles.csv', issue: 'Missing career_id or career_name', row });
      continue;
    }
    await prisma.careerRole.upsert({
      where: { id: career_id },
      update: {
        title: career_name,
        description,
        industryCategory: industry_category,
        status: status || 'ACTIVE'
      },
      create: {
        id: career_id,
        title: career_name,
        description,
        industryCategory: industry_category,
        status: status || 'ACTIVE'
      }
    });
    validRoleIds.add(career_id);
  }
  console.log(`✓ Seeded ${validRoleIds.size} career roles.`);

  // =========================================================================
  // 3. CAREER SKILLS (career_skills.csv)
  // =========================================================================
  console.log('\n[3/9] Seeding career skills from career_skills.csv...');
  const careerSkillsData = await parseCsvFile(path.join(dataDir, 'career_skills.csv'));
  let careerSkillCount = 0;

  for (const row of careerSkillsData) {
    const { career_id, skill_id, required_level, importance, source_id, verified } = row;
    if (!validRoleIds.has(career_id)) {
      orphanReports.push({ file: 'career_skills.csv', issue: `Invalid career_id: ${career_id}`, row });
      continue;
    }
    if (!validSkillIds.has(skill_id)) {
      orphanReports.push({ file: 'career_skills.csv', issue: `Invalid skill_id: ${skill_id}`, row });
      continue;
    }

    const minRequiredScore = parseInt(required_level, 10) || 50;
    const isVerified = verified === 'true' || verified === true || verified === 'TRUE';

    await prisma.careerSkill.upsert({
      where: {
        careerRoleId_skillId: {
          careerRoleId: career_id,
          skillId: skill_id
        }
      },
      update: {
        minRequiredScore,
        importance: importance || 'CORE',
        sourceId: source_id,
        verified: isVerified
      },
      create: {
        careerRoleId: career_id,
        skillId: skill_id,
        minRequiredScore,
        importance: importance || 'CORE',
        sourceId: source_id,
        verified: isVerified
      }
    });
    careerSkillCount++;
  }
  console.log(`✓ Seeded ${careerSkillCount} career skill mappings.`);

  // =========================================================================
  // 4. COMPANIES (companies.csv)
  // =========================================================================
  console.log('\n[4/9] Seeding companies from companies.csv...');
  const companiesData = await parseCsvFile(path.join(dataDir, 'companies.csv'));
  const validCompanyIds = new Set();

  for (const row of companiesData) {
    const { company_id, company_name, industry, description, website, location, verification_status, source_id } = row;
    if (!company_id || !company_name) {
      orphanReports.push({ file: 'companies.csv', issue: 'Missing company_id or company_name', row });
      continue;
    }

    // Ensure User account exists for the company
    const email = `contact@${company_id.toLowerCase()}.example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        firstName: company_name.split(' ')[0],
        lastName: company_name.split(' ').slice(1).join(' ') || 'Partner',
        role: 'INDUSTRY'
      },
      create: {
        email,
        password: defaultPasswordHash,
        firstName: company_name.split(' ')[0],
        lastName: company_name.split(' ').slice(1).join(' ') || 'Partner',
        role: 'INDUSTRY'
      }
    });

    await prisma.company.upsert({
      where: { id: company_id },
      update: {
        userId: user.id,
        name: company_name,
        industry: industry || 'Technology',
        description,
        website,
        location,
        isVerified: true,
        verificationStatus: verification_status || 'VERIFIED',
        sourceId: source_id
      },
      create: {
        id: company_id,
        userId: user.id,
        name: company_name,
        industry: industry || 'Technology',
        description,
        website,
        location,
        isVerified: true,
        verificationStatus: verification_status || 'VERIFIED',
        sourceId: source_id
      }
    });
    validCompanyIds.add(company_id);
  }
  console.log(`✓ Seeded ${validCompanyIds.size} companies.`);

  // =========================================================================
  // 5. OPPORTUNITIES (opportunities.csv)
  // =========================================================================
  console.log('\n[5/9] Seeding opportunities from opportunities.csv...');
  const oppsData = await parseCsvFile(path.join(dataDir, 'opportunities.csv'));
  const validOpportunityIds = new Set();

  for (const row of oppsData) {
    const {
      opportunity_id,
      company_id,
      title,
      opportunity_type,
      description,
      location,
      work_mode,
      duration,
      stipend,
      application_deadline,
      status,
      source_id,
      is_demo
    } = row;

    if (!validCompanyIds.has(company_id)) {
      orphanReports.push({ file: 'opportunities.csv', issue: `Invalid company_id: ${company_id}`, row });
      continue;
    }

    // Map opportunity type to enum
    let typeEnum = 'INTERNSHIP';
    const typeUpper = (opportunity_type || '').toUpperCase();
    if (typeUpper === 'FULL_TIME' || typeUpper === 'JOB') typeEnum = 'JOB';
    else if (typeUpper === 'APPRENTICESHIP') typeEnum = 'APPRENTICESHIP';
    else typeEnum = 'INTERNSHIP';

    // Map work mode
    let workModeEnum = 'HYBRID';
    const wmUpper = (work_mode || '').toUpperCase();
    if (wmUpper === 'REMOTE') workModeEnum = 'REMOTE';
    else if (wmUpper === 'ONSITE') workModeEnum = 'ONSITE';

    // Parse numeric stipend
    let numericStipend = 0;
    if (stipend) {
      const match = stipend.match(/\d+/g);
      if (match) numericStipend = parseFloat(match[0]);
    }

    const deadline = application_deadline ? new Date(application_deadline) : new Date('2026-12-31');

    await prisma.opportunity.upsert({
      where: { id: opportunity_id },
      update: {
        companyId: company_id,
        title,
        type: typeEnum,
        description: description || title,
        location: location || 'Bangalore',
        workMode: workModeEnum,
        duration: duration || '3 Months',
        stipend: numericStipend,
        rawStipend: stipend,
        deadline,
        status: status || 'ACTIVE',
        sourceId: source_id,
        isDemo: is_demo === 'true' || is_demo === true
      },
      create: {
        id: opportunity_id,
        companyId: company_id,
        title,
        type: typeEnum,
        description: description || title,
        location: location || 'Bangalore',
        workMode: workModeEnum,
        duration: duration || '3 Months',
        stipend: numericStipend,
        rawStipend: stipend,
        deadline,
        status: status || 'ACTIVE',
        sourceId: source_id,
        isDemo: is_demo === 'true' || is_demo === true
      }
    });

    // Populate opportunity skills for matching engine
    const defaultOppSkills = {
      OPP001: ['SK004', 'SK005', 'SK003', 'SK008'], // Full Stack: React, Node.js, Postgres, Git
      OPP002: ['SK001', 'SK002', 'SK010'],          // Data Analyst: Python, SQL, Power BI
      OPP003: ['SK007', 'SK008', 'SK001'],          // DevOps: Docker, Git, Python
      OPP004: ['SK005', 'SK003', 'SK009', 'SK007'], // Backend: Node.js, Postgres, REST APIs, Docker
      OPP005: ['SK004', 'SK006', 'SK011'],          // Frontend: React, TypeScript, Tailwind
      OPP006: ['SK010', 'SK002']                     // BI Reporting: Power BI, SQL
    };

    const targetSkills = defaultOppSkills[opportunity_id] || ['SK001', 'SK002'];
    for (const skId of targetSkills) {
      if (validSkillIds.has(skId)) {
        await prisma.opportunitySkill.upsert({
          where: {
            opportunityId_skillId: {
              opportunityId: opportunity_id,
              skillId: skId
            }
          },
          update: { minRequiredScore: 70 },
          create: {
            opportunityId: opportunity_id,
            skillId: skId,
            minRequiredScore: 70
          }
        });
      }
    }

    validOpportunityIds.add(opportunity_id);
  }
  console.log(`✓ Seeded ${validOpportunityIds.size} opportunities with opportunity skills.`);

  // =========================================================================
  // 6. STUDENTS (students.csv)
  // =========================================================================
  console.log('\n[6/9] Seeding students from students.csv...');
  const studentsData = await parseCsvFile(path.join(dataDir, 'students.csv'));
  const validStudentIds = new Set();

  // Career goal mapping for demonstration completeness
  const studentCareerGoalMap = {
    STU001: 'CAREER001', // Full Stack Developer
    STU002: 'CAREER002', // Data Analyst
    STU003: 'CAREER003', // Backend Engineer
    STU004: 'CAREER002', // Data Analyst
    STU005: 'CAREER005', // DevOps Engineer
    STU006: 'CAREER004'  // Frontend Engineer
  };

  for (const row of studentsData) {
    const { student_id, name, department, semester } = row;
    if (!student_id || !name) {
      orphanReports.push({ file: 'students.csv', issue: 'Missing student_id or name', row });
      continue;
    }

    const email = `${student_id.toLowerCase()}@student.edu`;
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'Student';

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        role: 'STUDENT'
      },
      create: {
        email,
        password: defaultPasswordHash,
        firstName,
        lastName,
        role: 'STUDENT'
      }
    });

    const careerGoalId = studentCareerGoalMap[student_id] || 'CAREER002';
    const sem = parseInt(semester, 10) || 6;

    await prisma.student.upsert({
      where: { id: student_id },
      update: {
        userId: user.id,
        department,
        branch: department,
        semester: sem,
        careerGoalId: validRoleIds.has(careerGoalId) ? careerGoalId : null,
        degree: 'B.Tech',
        cgpa: 8.5,
        gradYear: 2026
      },
      create: {
        id: student_id,
        userId: user.id,
        department,
        branch: department,
        semester: sem,
        careerGoalId: validRoleIds.has(careerGoalId) ? careerGoalId : null,
        degree: 'B.Tech',
        cgpa: 8.5,
        gradYear: 2026
      }
    });

    // Provide initial student skills aligned with career goal so gap analysis & matching calculate reliably
    const sampleSkillScores = {
      STU001: { SK004: 85, SK005: 80, SK003: 75, SK008: 70 },
      STU002: { SK001: 80, SK002: 85, SK010: 75, SK014: 70 },
      STU003: { SK005: 85, SK003: 80, SK009: 80, SK007: 65 },
      STU004: { SK001: 70, SK002: 60, SK010: 55, SK014: 65 },
      STU005: { SK007: 90, SK008: 85, SK001: 70 },
      STU006: { SK004: 90, SK006: 80, SK011: 80 }
    };

    const initialScores = sampleSkillScores[student_id] || {};
    for (const [sId, score] of Object.entries(initialScores)) {
      if (validSkillIds.has(sId)) {
        await prisma.studentSkill.upsert({
          where: {
            studentId_skillId: {
              studentId: student_id,
              skillId: sId
            }
          },
          update: { score, isVerified: true },
          create: {
            studentId: student_id,
            skillId: sId,
            score,
            isVerified: true
          }
        });
      }
    }

    validStudentIds.add(student_id);
  }
  console.log(`✓ Seeded ${validStudentIds.size} students with User logins and profile links.`);

  // =========================================================================
  // 7. ASSESSMENT QUESTIONS (assessment_questions.csv)
  // =========================================================================
  console.log('\n[7/9] Seeding assessment questions from assessment_questions.csv...');
  const questionsData = await parseCsvFile(path.join(dataDir, 'assessment_questions.csv'));
  let questionCount = 0;

  for (const row of questionsData) {
    const {
      question_id,
      skill_id,
      question_text,
      question_type,
      difficulty,
      options,
      correct_answer,
      score,
      explanation,
      source_id,
      status
    } = row;

    if (!validSkillIds.has(skill_id)) {
      orphanReports.push({ file: 'assessment_questions.csv', issue: `Invalid skill_id: ${skill_id}`, row });
      continue;
    }

    // Parse options from JSON format e.g. {"A":"WHERE","B":"HAVING",...}
    let parsedOptions = [];
    try {
      const optsObj = JSON.parse(options);
      parsedOptions = ['A', 'B', 'C', 'D'].map((k) => optsObj[k] || '');
    } catch {
      parsedOptions = (options || '').split('|').map((o) => o.trim());
    }

    const answerLetter = (correct_answer || 'A').toUpperCase();
    const correctOptionIndex = { A: 0, B: 1, C: 2, D: 3 }[answerLetter] ?? 0;
    const numericScore = parseInt(score, 10) || 10;
    const difficultyNum = difficultyToNumber(difficulty);

    await prisma.assessmentQuestion.upsert({
      where: { id: question_id },
      update: {
        skillId: skill_id,
        questionText: question_text,
        questionType: question_type || 'MCQ',
        options: parsedOptions,
        correctOption: correctOptionIndex,
        correctAnswer: answerLetter,
        difficulty: difficultyNum,
        difficultyLevel: difficulty || 'INTERMEDIATE',
        score: numericScore,
        explanation,
        sourceId: source_id,
        status: status || 'ACTIVE'
      },
      create: {
        id: question_id,
        skillId: skill_id,
        questionText: question_text,
        questionType: question_type || 'MCQ',
        options: parsedOptions,
        correctOption: correctOptionIndex,
        correctAnswer: answerLetter,
        difficulty: difficultyNum,
        difficultyLevel: difficulty || 'INTERMEDIATE',
        score: numericScore,
        explanation,
        sourceId: source_id,
        status: status || 'ACTIVE'
      }
    });
    questionCount++;
  }
  console.log(`✓ Seeded ${questionCount} assessment questions.`);

  // =========================================================================
  // 8. LEARNING RESOURCES (learning_resources.csv)
  // =========================================================================
  console.log('\n[8/9] Seeding learning resources from learning_resources.csv...');
  const resourcesData = await parseCsvFile(path.join(dataDir, 'learning_resources.csv'));
  let resourceCount = 0;

  for (const row of resourcesData) {
    const {
      resource_id,
      title,
      provider,
      resource_type,
      skill_id,
      difficulty,
      url,
      duration,
      is_free,
      source_id,
      status
    } = row;

    if (!validSkillIds.has(skill_id)) {
      orphanReports.push({ file: 'learning_resources.csv', issue: `Invalid skill_id: ${skill_id}`, row });
      continue;
    }

    const freeBool = is_free === 'true' || is_free === true || is_free === 'TRUE';

    await prisma.learningResource.upsert({
      where: { id: resource_id },
      update: {
        title,
        provider,
        resourceType: resource_type || 'COURSE',
        skillId: skill_id,
        difficulty: difficulty || 'BEGINNER',
        url,
        duration: duration || 'Self-paced',
        isFree: freeBool,
        sourceId: source_id,
        status: status || 'ACTIVE'
      },
      create: {
        id: resource_id,
        title,
        provider,
        resourceType: resource_type || 'COURSE',
        skillId: skill_id,
        difficulty: difficulty || 'BEGINNER',
        url,
        duration: duration || 'Self-paced',
        isFree: freeBool,
        sourceId: source_id,
        status: status || 'ACTIVE'
      }
    });
    resourceCount++;
  }
  console.log(`✓ Seeded ${resourceCount} learning resources.`);

  // =========================================================================
  // 9. APPLICATIONS (applications.csv)
  // =========================================================================
  console.log('\n[9/9] Seeding applications from applications.csv...');
  const applicationsData = await parseCsvFile(path.join(dataDir, 'applications.csv'));
  let applicationCount = 0;

  for (const row of applicationsData) {
    const { application_id, student_id, opportunity_id, status } = row;

    if (!validStudentIds.has(student_id)) {
      orphanReports.push({ file: 'applications.csv', issue: `Invalid student_id: ${student_id}`, row });
      continue;
    }
    if (!validOpportunityIds.has(opportunity_id)) {
      orphanReports.push({ file: 'applications.csv', issue: `Invalid opportunity_id: ${opportunity_id}`, row });
      continue;
    }

    // Validate enum status
    let appStatus = 'APPLIED';
    const statusUpper = (status || '').toUpperCase();
    if (['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'].includes(statusUpper)) {
      appStatus = statusUpper;
    }

    await prisma.application.upsert({
      where: {
        studentId_opportunityId: {
          studentId: student_id,
          opportunityId: opportunity_id
        }
      },
      update: {
        status: appStatus
      },
      create: {
        id: application_id,
        studentId: student_id,
        opportunityId: opportunity_id,
        status: appStatus
      }
    });
    applicationCount++;
  }
  console.log(`✓ Seeded ${applicationCount} applications.`);

  // =========================================================================
  // FINAL VERIFICATION & REPORT
  // =========================================================================
  console.log('\n======================================================');
  console.log('              FINAL DATABASE RECORD COUNTS            ');
  console.log('======================================================');
  const counts = {
    Skills: await prisma.skill.count(),
    'Career Roles': await prisma.careerRole.count(),
    'Career Skills': await prisma.careerSkill.count(),
    'Assessment Questions': await prisma.assessmentQuestion.count(),
    'Learning Resources': await prisma.learningResource.count(),
    Companies: await prisma.company.count(),
    Opportunities: await prisma.opportunity.count(),
    Students: await prisma.student.count(),
    Applications: await prisma.application.count()
  };

  for (const [entity, count] of Object.entries(counts)) {
    console.log(`  ${entity.padEnd(24)} : ${count}`);
  }

  console.log('======================================================');
  if (orphanReports.length === 0) {
    console.log('✓ All relations resolved successfully (0 orphan records).');
  } else {
    console.warn(`⚠️ Found ${orphanReports.length} orphan records:`);
    console.warn(JSON.stringify(orphanReports, null, 2));
  }
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('Seed process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
