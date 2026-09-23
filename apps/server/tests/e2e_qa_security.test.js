const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:5000/api';

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  categories: {}
};

function recordTest(category, name, passed, detail = '') {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`  [PASS] ${name}`);
  } else {
    results.failed++;
    console.error(`  [FAIL] ${name} -> ${detail}`);
  }
  if (!results.categories[category]) {
    results.categories[category] = { total: 0, passed: 0, failed: 0, tests: [] };
  }
  results.categories[category].total++;
  if (passed) results.categories[category].passed++;
  else results.categories[category].failed++;
  results.categories[category].tests.push({ name, passed, detail });
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('   ACADEMIA-INDUSTRY PLATFORM - END-TO-END QA & SECURITY SUITE  ');
  console.log('================================================================\n');

  // Tokens holder
  const tokens = {
    STUDENT: null,
    STUDENT_2: null,
    INDUSTRY: null,
    FACULTY: null,
    INSTITUTION_ADMIN: null,
  };
  const users = {
    STUDENT: null,
    STUDENT_2: null,
    INDUSTRY: null,
    FACULTY: null,
    INSTITUTION_ADMIN: null,
  };

  // ----------------------------------------------------------------
  // 1. AUTHENTICATION & PRIVILEGE ESCALATION
  // ----------------------------------------------------------------
  console.log('--- 1. AUTHENTICATION & PRIVILEGE ESCALATION ---');

  // Test 1.1: Valid login for all 4 roles
  for (const [role, creds] of Object.entries({
    STUDENT: { email: 'student1@university.edu', password: 'password123' },
    STUDENT_2: { email: 'student2@university.edu', password: 'password123' },
    INDUSTRY: { email: 'recruiter@innovatetech.com', password: 'password123' },
    FACULTY: { email: 'faculty1@university.edu', password: 'password123' },
    INSTITUTION_ADMIN: { email: 'admin@institution.edu', password: 'password123' },
  })) {
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, creds);
      tokens[role] = res.data.token;
      users[role] = res.data.user;
      recordTest('Authentication', `Valid Login (${role})`, res.status === 200 && Boolean(res.data.token));
    } catch (e) {
      recordTest('Authentication', `Valid Login (${role})`, false, e.message);
    }
  }

  // Test 1.2: Invalid password
  try {
    await axios.post(`${BASE_URL}/auth/login`, { email: 'student1@university.edu', password: 'wrong_password_999' });
    recordTest('Authentication', 'Invalid Password Rejection (401)', false, 'Expected 401 but got 200');
  } catch (e) {
    recordTest('Authentication', 'Invalid Password Rejection (401)', e.response?.status === 401);
  }

  // Test 1.3: Non-existent user
  try {
    await axios.post(`${BASE_URL}/auth/login`, { email: 'ghost_user_999@univ.edu', password: 'password123' });
    recordTest('Authentication', 'Non-existent User Rejection (401)', false, 'Expected 401');
  } catch (e) {
    recordTest('Authentication', 'Non-existent User Rejection (401)', e.response?.status === 401);
  }

  // Test 1.4: Missing input in login
  try {
    await axios.post(`${BASE_URL}/auth/login`, { email: '' });
    recordTest('Authentication', 'Missing Login Input (400)', false, 'Expected 400');
  } catch (e) {
    recordTest('Authentication', 'Missing Login Input (400)', e.response?.status === 400);
  }

  // Test 1.5: Security - Privilege Escalation via Register (Attempt to register as INSTITUTION_ADMIN)
  try {
    await axios.post(`${BASE_URL}/auth/register`, {
      email: `hacker_${Date.now()}@darkweb.org`,
      password: 'password123',
      firstName: 'Evil',
      lastName: 'Admin',
      role: 'INSTITUTION_ADMIN'
    });
    recordTest('Security - Privilege Escalation', 'Reject Public Admin Registration (400/403)', false, 'Security Vulnerability: Public user created as INSTITUTION_ADMIN!');
  } catch (e) {
    const isProtected = e.response?.status === 400 || e.response?.status === 403;
    recordTest('Security - Privilege Escalation', 'Reject Public Admin Registration (400/403)', isProtected, `Blocked with status ${e.response?.status}`);
  }

  // Test 1.6: Valid registration as Student
  const newStudentEmail = `newstudent_${Date.now()}@university.edu`;
  try {
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: newStudentEmail,
      password: 'password123',
      firstName: 'New',
      lastName: 'Student',
      role: 'STUDENT'
    });
    recordTest('Authentication', 'Valid Student Registration (201)', regRes.status === 201);
  } catch (e) {
    recordTest('Authentication', 'Valid Student Registration (201)', false, e.message);
  }

  // Test 1.7: Duplicate email registration rejection
  try {
    await axios.post(`${BASE_URL}/auth/register`, {
      email: newStudentEmail,
      password: 'password123',
      firstName: 'Duplicate',
      lastName: 'Student',
      role: 'STUDENT'
    });
    recordTest('Authentication', 'Duplicate Email Registration (400)', false, 'Allowed duplicate');
  } catch (e) {
    recordTest('Authentication', 'Duplicate Email Registration (400)', e.response?.status === 400);
  }

  // ----------------------------------------------------------------
  // 2. JWT MANIPULATION & UNAUTHORIZED ACCESS
  // ----------------------------------------------------------------
  console.log('\n--- 2. JWT SECURITY & AUTHORIZATION ---');

  // Test 2.1: Missing Token
  try {
    await axios.get(`${BASE_URL}/student/profile/me`);
    recordTest('Security - JWT', 'Missing Auth Header (401)', false, 'Unauthenticated access permitted');
  } catch (e) {
    recordTest('Security - JWT', 'Missing Auth Header (401)', e.response?.status === 401);
  }

  // Test 2.2: Malformed Token
  try {
    await axios.get(`${BASE_URL}/student/profile/me`, {
      headers: { Authorization: 'Bearer invalid.malformed.token' }
    });
    recordTest('Security - JWT', 'Malformed JWT Token (401)', false, 'Accepted malformed token');
  } catch (e) {
    recordTest('Security - JWT', 'Malformed JWT Token (401)', e.response?.status === 401);
  }

  // Test 2.3: Tampered Token Signature
  try {
    const tampered = tokens.STUDENT.substring(0, tokens.STUDENT.length - 8) + 'ABCDEF12';
    await axios.get(`${BASE_URL}/student/profile/me`, {
      headers: { Authorization: `Bearer ${tampered}` }
    });
    recordTest('Security - JWT', 'Tampered Signature Token (401)', false, 'Accepted tampered token');
  } catch (e) {
    recordTest('Security - JWT', 'Tampered Signature Token (401)', e.response?.status === 401);
  }

  // Test 2.4: Wrong Role Access (STUDENT accessing Admin overview)
  try {
    await axios.get(`${BASE_URL}/analytics/overview`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Authorization', 'Student accessing Admin Analytics (403)', false, 'Privilege escalation permitted');
  } catch (e) {
    recordTest('Authorization', 'Student accessing Admin Analytics (403)', e.response?.status === 403);
  }

  // Test 2.5: Wrong Role Access (INDUSTRY attempting to submit assessment)
  try {
    await axios.post(`${BASE_URL}/assessments/submit`, { skillId: 'some-id', answers: [] }, {
      headers: { Authorization: `Bearer ${tokens.INDUSTRY}` }
    });
    recordTest('Authorization', 'Industry submitting Student Assessment (403)', false, 'Wrong role allowed');
  } catch (e) {
    recordTest('Authorization', 'Industry submitting Student Assessment (403)', e.response?.status === 403);
  }

  // ----------------------------------------------------------------
  // 3. STUDENT PROFILE & CAREER GOAL
  // ----------------------------------------------------------------
  console.log('\n--- 3. STUDENT PROFILE & CAREER GOAL ---');

  let studentProfileId = null;
  let targetRoleId = null;

  // Test 3.1: Get Student Profile (Happy path)
  try {
    const res = await axios.get(`${BASE_URL}/student/profile/me`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    studentProfileId = res.data.id;
    targetRoleId = res.data.careerGoalId;
    recordTest('Profile Management', 'Get Student Profile (200)', res.status === 200 && Boolean(res.data.id));
  } catch (e) {
    recordTest('Profile Management', 'Get Student Profile (200)', false, e.message);
  }

  // Test 3.2: Get Resume Data
  try {
    const res = await axios.get(`${BASE_URL}/student/resume`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Profile Management', 'Get Resume Data (200)', res.status === 200 && Array.isArray(res.data.skills));
  } catch (e) {
    recordTest('Profile Management', 'Get Resume Data (200)', false, e.message);
  }

  // Test 3.3: Update Career Goal - Valid input
  try {
    const roles = await prisma.careerRole.findMany();
    targetRoleId = roles[0].id;
    const res = await axios.post(`${BASE_URL}/student/career-goal`, { careerGoalId: targetRoleId }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Profile Management', 'Update Career Goal Valid (200)', res.status === 200);
  } catch (e) {
    recordTest('Profile Management', 'Update Career Goal Valid (200)', false, e.message);
  }

  // Test 3.4: Update Career Goal - Non-existent role ID (404)
  try {
    await axios.post(`${BASE_URL}/student/career-goal`, { careerGoalId: '00000000-0000-0000-0000-000000000000' }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Profile Management', 'Update Career Goal Non-existent Role (404)', false, 'Expected 404');
  } catch (e) {
    recordTest('Profile Management', 'Update Career Goal Non-existent Role (404)', e.response?.status === 404);
  }

  // Test 3.5: Update Career Goal - Missing input (400)
  try {
    await axios.post(`${BASE_URL}/student/career-goal`, {}, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Profile Management', 'Update Career Goal Missing Input (400)', false, 'Expected 400');
  } catch (e) {
    recordTest('Profile Management', 'Update Career Goal Missing Input (400)', e.response?.status === 400);
  }

  // ----------------------------------------------------------------
  // 4. SKILLS & ASSESSMENT CENTER
  // ----------------------------------------------------------------
  console.log('\n--- 4. SKILLS & ASSESSMENT CENTER ---');

  let testSkillId = null;

  // Test 4.1: Fetch available skills
  try {
    const res = await axios.get(`${BASE_URL}/skills`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    testSkillId = res.data[0].id;
    recordTest('Skill Assessment', 'Fetch Skills List (200)', res.status === 200 && res.data.length > 0);
  } catch (e) {
    recordTest('Skill Assessment', 'Fetch Skills List (200)', false, e.message);
  }

  // Test 4.2: Fetch Assessment Questions (Happy path, ensure correctOption is NOT leaked)
  try {
    const res = await axios.get(`${BASE_URL}/assessments/questions/${testSkillId}`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    const hasLeak = res.data.some(q => q.correctOption !== undefined);
    recordTest('Skill Assessment', 'Fetch Assessment Questions (200)', res.status === 200 && res.data.length > 0);
    recordTest('Security - Sensitive Data Leakage', 'No Correct Option Leak in Assessment (Safe)', !hasLeak);
  } catch (e) {
    recordTest('Skill Assessment', 'Fetch Assessment Questions (200)', false, e.message);
    recordTest('Security - Sensitive Data Leakage', 'No Correct Option Leak in Assessment (Safe)', false);
  }

  // Test 4.3: Submit Assessment - Valid answers
  try {
    const questionsRes = await prisma.assessmentQuestion.findMany({ where: { skillId: testSkillId } });
    const mockAnswers = questionsRes.map(q => ({ questionId: q.id, answerIndex: q.correctOption }));

    const res = await axios.post(`${BASE_URL}/assessments/submit`, {
      skillId: testSkillId,
      answers: mockAnswers
    }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Skill Assessment', 'Submit Assessment Valid (200)', res.status === 200 && res.data.score === 100);
  } catch (e) {
    recordTest('Skill Assessment', 'Submit Assessment Valid (200)', false, e.message);
  }

  // Test 4.4: Submit Assessment - Missing input (400)
  try {
    await axios.post(`${BASE_URL}/assessments/submit`, {}, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Skill Assessment', 'Submit Assessment Missing Input (400)', false, 'Expected 400');
  } catch (e) {
    recordTest('Skill Assessment', 'Submit Assessment Missing Input (400)', e.response?.status === 400);
  }

  // Test 4.5: Submit Assessment - Non-existent skillId (404)
  try {
    await axios.post(`${BASE_URL}/assessments/submit`, {
      skillId: '00000000-0000-0000-0000-000000000000',
      answers: []
    }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Skill Assessment', 'Submit Assessment Non-existent Skill (404)', false, 'Expected 404');
  } catch (e) {
    recordTest('Skill Assessment', 'Submit Assessment Non-existent Skill (404)', e.response?.status === 404);
  }

  // ----------------------------------------------------------------
  // 5. SKILL GAP ANALYSIS & LEARNING RECOMMENDATIONS
  // ----------------------------------------------------------------
  console.log('\n--- 5. SKILL GAP ANALYSIS & RECOMMENDATIONS ---');

  // Test 5.1: Skill Gap Analysis (Happy path)
  try {
    const res = await axios.get(`${BASE_URL}/gap/analyze`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    const validReadiness = typeof res.data.readiness === 'number' && !isNaN(res.data.readiness);
    recordTest('Skill Gap Calculation', 'Deterministic Gap Analysis (200)', res.status === 200 && validReadiness);
    recordTest('Learning Recommendations', 'Fetch Course Recommendations (200)', Array.isArray(res.data.recommendations));
  } catch (e) {
    recordTest('Skill Gap Calculation', 'Deterministic Gap Analysis (200)', false, e.message);
    recordTest('Learning Recommendations', 'Fetch Course Recommendations (200)', false, e.message);
  }

  // Test 5.2: Skill Gap Wrong Role Check (INDUSTRY user)
  try {
    await axios.get(`${BASE_URL}/gap/analyze`, {
      headers: { Authorization: `Bearer ${tokens.INDUSTRY}` }
    });
    recordTest('Skill Gap Calculation', 'Industry Calling Student Gap Route (403)', false, 'Expected 403');
  } catch (e) {
    recordTest('Skill Gap Calculation', 'Industry Calling Student Gap Route (403)', e.response?.status === 403);
  }

  // ----------------------------------------------------------------
  // 6. OPPORTUNITY CREATION, SEARCH & FILTERING
  // ----------------------------------------------------------------
  console.log('\n--- 6. OPPORTUNITY LIFECYCLE & SEARCH ---');

  let createdOpportunityId = null;

  // Test 6.1: Industry Create Opportunity (Happy path)
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 45);
  try {
    const res = await axios.post(`${BASE_URL}/opportunities`, {
      type: 'INTERNSHIP',
      title: 'QA Automated Test Engineer Intern',
      description: 'End-to-end integration and security testing for enterprise analytics portals.',
      location: 'Bangalore / Remote',
      workMode: 'REMOTE',
      stipend: 30000,
      minCgpa: 7.5,
      requiredDegree: 'B.Tech',
      requiredBranch: 'Computer Science',
      graduationYear: 2026,
      deadline: deadline.toISOString(),
      skills: [{ id: testSkillId, minScore: 70 }]
    }, {
      headers: { Authorization: `Bearer ${tokens.INDUSTRY}` }
    });
    createdOpportunityId = res.data.id;
    recordTest('Opportunity Creation', 'Industry Post Opportunity (201)', res.status === 201 && Boolean(res.data.id));
  } catch (e) {
    recordTest('Opportunity Creation', 'Industry Post Opportunity (201)', false, e.message);
  }

  // Test 6.2: Student Attempt to Create Opportunity (Wrong role)
  try {
    await axios.post(`${BASE_URL}/opportunities`, {
      type: 'INTERNSHIP',
      title: 'Hacked Opportunity',
      description: 'Should not be allowed',
      location: 'None',
      workMode: 'REMOTE',
      deadline: deadline.toISOString(),
      skills: [{ id: testSkillId, minScore: 70 }]
    }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Opportunity Creation', 'Student Post Opportunity (403)', false, 'Student allowed to post opportunity');
  } catch (e) {
    recordTest('Opportunity Creation', 'Student Post Opportunity (403)', e.response?.status === 403);
  }

  // Test 6.3: Missing / Invalid fields in Opportunity creation
  try {
    await axios.post(`${BASE_URL}/opportunities`, {
      type: 'INTERNSHIP',
      title: ''
    }, {
      headers: { Authorization: `Bearer ${tokens.INDUSTRY}` }
    });
    recordTest('Opportunity Creation', 'Missing Fields Validation (400)', false, 'Allowed invalid opportunity');
  } catch (e) {
    recordTest('Opportunity Creation', 'Missing Fields Validation (400)', e.response?.status === 400);
  }

  // Test 6.4: Opportunity Search with keyword
  try {
    const res = await axios.get(`${BASE_URL}/opportunities/search?q=QA`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Opportunity Search', 'Search by Keyword (200)', res.status === 200 && res.data.length > 0);
  } catch (e) {
    recordTest('Opportunity Search', 'Search by Keyword (200)', false, e.message);
  }

  // Test 6.5: Opportunity Filtering (by type & mode)
  try {
    const res = await axios.get(`${BASE_URL}/opportunities/search?type=INTERNSHIP&mode=REMOTE`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Opportunity Filtering', 'Filter by Type and WorkMode (200)', res.status === 200);
  } catch (e) {
    recordTest('Opportunity Filtering', 'Filter by Type and WorkMode (200)', false, e.message);
  }

  // Test 6.6: Get Opportunity Details (Happy path)
  try {
    const res = await axios.get(`${BASE_URL}/opportunities/${createdOpportunityId}`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Opportunity Search', 'Get Opportunity Details (200)', res.status === 200 && res.data.id === createdOpportunityId);
  } catch (e) {
    recordTest('Opportunity Search', 'Get Opportunity Details (200)', false, e.message);
  }

  // Test 6.7: Get Opportunity Details - Non-existent ID (404)
  try {
    await axios.get(`${BASE_URL}/opportunities/00000000-0000-0000-0000-000000000000`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Opportunity Search', 'Get Non-existent Opportunity (404)', false, 'Expected 404');
  } catch (e) {
    recordTest('Opportunity Search', 'Get Non-existent Opportunity (404)', e.response?.status === 404);
  }

  // ----------------------------------------------------------------
  // 7. DETERMINISTIC MATCHING ENGINE
  // ----------------------------------------------------------------
  console.log('\n--- 7. DETERMINISTIC MATCHING ENGINE ---');

  // Test 7.1: Calculate Match Score (Happy path)
  try {
    const res = await axios.get(`${BASE_URL}/matching/match/${studentProfileId}/${createdOpportunityId}`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    const { overallMatch, skillMatch, eligibilityScore, interestScore } = res.data;
    // Check 70% Skill + 20% Eligibility + 10% Interest formula
    const expectedMatch = Math.round((0.70 * skillMatch) + (0.20 * eligibilityScore) + (0.10 * interestScore));
    const formulaCorrect = Math.abs(overallMatch - expectedMatch) <= 1; // allow +/-1 for rounding

    recordTest('Matching Engine', 'Deterministic Formula Verification (70/20/10)', formulaCorrect, `Calculated ${overallMatch} vs expected ${expectedMatch}`);
    recordTest('Matching Engine', 'Explainable Breakdown Present', Array.isArray(res.data.matchingSkills) && Array.isArray(res.data.skillGaps));
  } catch (e) {
    recordTest('Matching Engine', 'Deterministic Formula Verification (70/20/10)', false, e.message);
    recordTest('Matching Engine', 'Explainable Breakdown Present', false);
  }

  // Test 7.2: Recommendations for Student
  try {
    const res = await axios.get(`${BASE_URL}/matching/recommendations/opportunities`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Matching Engine', 'Student Recommended Opportunities (200)', res.status === 200 && res.data.length > 0);
  } catch (e) {
    recordTest('Matching Engine', 'Student Recommended Opportunities (200)', false, e.message);
  }

  // Test 7.3: Candidate Recommendations for Opportunity (Industry)
  try {
    const res = await axios.get(`${BASE_URL}/matching/recommendations/candidates/${createdOpportunityId}`, {
      headers: { Authorization: `Bearer ${tokens.INDUSTRY}` }
    });
    recordTest('Matching Engine', 'Recruiter Candidate Recommendations (200)', res.status === 200 && res.data.length > 0);
  } catch (e) {
    recordTest('Matching Engine', 'Recruiter Candidate Recommendations (200)', false, e.message);
  }

  // Test 7.4: IDOR Protection on Match Calculation (Student 1 attempting to view Student 2's match)
  try {
    const s2Profile = await prisma.student.findFirst({ where: { user: { email: 'student2@university.edu' } } });
    await axios.get(`${BASE_URL}/matching/match/${s2Profile.id}/${createdOpportunityId}`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Security - IDOR', 'Prevent Student from Viewing Other Match (403)', false, 'IDOR vulnerability: Student viewed another profile match');
  } catch (e) {
    recordTest('Security - IDOR', 'Prevent Student from Viewing Other Match (403)', e.response?.status === 403);
  }

  // ----------------------------------------------------------------
  // 8. APPLICATIONS LIFECYCLE & IDOR GUARDS
  // ----------------------------------------------------------------
  console.log('\n--- 8. APPLICATIONS LIFECYCLE & IDOR GUARDS ---');

  let applicationId = null;

  // Test 8.1: Student Apply (Happy path)
  try {
    const res = await axios.post(`${BASE_URL}/applications/apply`, {
      opportunityId: createdOpportunityId
    }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    applicationId = res.data.id;
    recordTest('Applications', 'Student Apply to Opportunity (201)', res.status === 201 && Boolean(res.data.id));
  } catch (e) {
    recordTest('Applications', 'Student Apply to Opportunity (201)', false, e.message);
  }

  // Test 8.2: Duplicate Application Prevention (409 Conflict)
  try {
    await axios.post(`${BASE_URL}/applications/apply`, {
      opportunityId: createdOpportunityId
    }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Applications', 'Duplicate Application Prevention (409)', false, 'Allowed duplicate application');
  } catch (e) {
    recordTest('Applications', 'Duplicate Application Prevention (409)', e.response?.status === 409);
  }

  // Test 8.3: Apply to Non-existent Opportunity (404)
  try {
    await axios.post(`${BASE_URL}/applications/apply`, {
      opportunityId: '00000000-0000-0000-0000-000000000000'
    }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Applications', 'Apply to Non-existent Opportunity (404)', false, 'Expected 404');
  } catch (e) {
    recordTest('Applications', 'Apply to Non-existent Opportunity (404)', e.response?.status === 404);
  }

  // Test 8.4: Industry View Company Applications
  try {
    const res = await axios.get(`${BASE_URL}/applications/company`, {
      headers: { Authorization: `Bearer ${tokens.INDUSTRY}` }
    });
    recordTest('Applications', 'Industry View Received Applications (200)', res.status === 200 && Array.isArray(res.data));
  } catch (e) {
    recordTest('Applications', 'Industry View Received Applications (200)', false, e.message);
  }

  // Test 8.5: Student View My Applications
  try {
    const res = await axios.get(`${BASE_URL}/applications/student`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Applications', 'Student View Own Applications (200)', res.status === 200 && res.data.length > 0);
  } catch (e) {
    recordTest('Applications', 'Student View Own Applications (200)', false, e.message);
  }

  // Test 8.6: Industry Update Status (Happy path - SHORTLISTED)
  try {
    const res = await axios.patch(`${BASE_URL}/applications/${applicationId}/status`, {
      status: 'SHORTLISTED'
    }, {
      headers: { Authorization: `Bearer ${tokens.INDUSTRY}` }
    });
    recordTest('Application Status', 'Recruiter Shortlist Applicant (200)', res.status === 200 && res.data.status === 'SHORTLISTED');
  } catch (e) {
    recordTest('Application Status', 'Recruiter Shortlist Applicant (200)', false, e.message);
  }

  // Test 8.7: Invalid Application Status Rejection (400)
  try {
    await axios.patch(`${BASE_URL}/applications/${applicationId}/status`, {
      status: 'INVALID_STATUS_XYZ'
    }, {
      headers: { Authorization: `Bearer ${tokens.INDUSTRY}` }
    });
    recordTest('Application Status', 'Invalid Status Enum Rejection (400)', false, 'Allowed invalid status');
  } catch (e) {
    recordTest('Application Status', 'Invalid Status Enum Rejection (400)', e.response?.status === 400);
  }

  // Test 8.8: IDOR Check - Other Recruiter / Student cannot update application status (403)
  try {
    await axios.patch(`${BASE_URL}/applications/${applicationId}/status`, {
      status: 'REJECTED'
    }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Security - IDOR', 'Student Cannot Modify Application Status (403)', false, 'IDOR vulnerability');
  } catch (e) {
    recordTest('Security - IDOR', 'Student Cannot Modify Application Status (403)', e.response?.status === 403);
  }

  // ----------------------------------------------------------------
  // 9. DIGITAL PORTFOLIO & IDOR HARDENING
  // ----------------------------------------------------------------
  console.log('\n--- 9. DIGITAL PORTFOLIO & IDOR HARDENING ---');

  let projectId = null;
  let certificateId = null;

  // Test 9.1: Student Add Project (Happy path)
  try {
    const res = await axios.post(`${BASE_URL}/portfolio/projects`, {
      name: 'Distributed Cloud Microservices Capstone',
      description: 'Engineered high-throughput event-driven microservices with Redis and Kafka.',
      url: 'https://github.com/student/cloud-capstone'
    }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    projectId = res.data.id;
    recordTest('Portfolio', 'Add Portfolio Project (201)', res.status === 201 && Boolean(res.data.id));
  } catch (e) {
    recordTest('Portfolio', 'Add Portfolio Project (201)', false, e.message);
  }

  // Test 9.2: Add Project Missing Input (400)
  try {
    await axios.post(`${BASE_URL}/portfolio/projects`, { name: '' }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Portfolio', 'Add Project Missing Fields (400)', false, 'Allowed empty project');
  } catch (e) {
    recordTest('Portfolio', 'Add Project Missing Fields (400)', e.response?.status === 400);
  }

  // Test 9.3: Student Add Certificate (Happy path)
  try {
    const res = await axios.post(`${BASE_URL}/portfolio/certificates`, {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: '2026-01-15',
      url: 'https://aws.amazon.com/verify/12345'
    }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    certificateId = res.data.id;
    recordTest('Portfolio', 'Add Portfolio Certificate (201)', res.status === 201 && Boolean(res.data.id));
  } catch (e) {
    recordTest('Portfolio', 'Add Portfolio Certificate (201)', false, e.message);
  }

  // Test 9.4: IDOR Attack - Student 2 attempting to modify Student 1's project (403)
  try {
    await axios.put(`${BASE_URL}/portfolio/projects/${projectId}`, {
      name: 'Defaced by Malicious Actor'
    }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT_2}` }
    });
    recordTest('Security - IDOR', 'Prevent Cross-Student Project Edit (403)', false, 'IDOR vulnerability: Student 2 modified Student 1 project');
  } catch (e) {
    recordTest('Security - IDOR', 'Prevent Cross-Student Project Edit (403)', e.response?.status === 403);
  }

  // Test 9.5: IDOR Attack - Student 2 attempting to delete Student 1's certificate (403)
  try {
    await axios.delete(`${BASE_URL}/portfolio/certificates/${certificateId}`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT_2}` }
    });
    recordTest('Security - IDOR', 'Prevent Cross-Student Certificate Deletion (403)', false, 'IDOR vulnerability: Student 2 deleted Student 1 cert');
  } catch (e) {
    recordTest('Security - IDOR', 'Prevent Cross-Student Certificate Deletion (403)', e.response?.status === 403);
  }

  // Test 9.6: Student 1 updates own project (Happy path)
  try {
    const res = await axios.put(`${BASE_URL}/portfolio/projects/${projectId}`, {
      name: 'Distributed Cloud Microservices Capstone (Enhanced)'
    }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Portfolio', 'Owner Update Project (200)', res.status === 200 && res.data.name.includes('Enhanced'));
  } catch (e) {
    recordTest('Portfolio', 'Owner Update Project (200)', false, e.message);
  }

  // Test 9.7: View Portfolio by Student ID
  try {
    const res = await axios.get(`${BASE_URL}/portfolio/${studentProfileId}`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Portfolio', 'View Portfolio by ID (200)', res.status === 200 && res.data.projects.length > 0);
  } catch (e) {
    recordTest('Portfolio', 'View Portfolio by ID (200)', false, e.message);
  }

  // ----------------------------------------------------------------
  // 10. FILE UPLOADS & SECURITY VULNERABILITIES
  // ----------------------------------------------------------------
  console.log('\n--- 10. FILE UPLOADS & SECURITY VULNERABILITIES ---');

  // Test 10.1: Resume Upload - Valid PDF
  const samplePdfPath = path.join(__dirname, 'sample_resume.pdf');
  fs.writeFileSync(samplePdfPath, '%PDF-1.4\n%Fake PDF content for automated test\nSQL Python Power BI Data Analyst\n%%EOF');

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(samplePdfPath), {
      filename: 'sample_resume.pdf',
      contentType: 'application/pdf'
    });
    const res = await axios.post(`${BASE_URL}/portfolio/resume/upload`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Resume Upload', 'Upload Valid PDF Resume (200)', res.status === 200 && Boolean(res.data.filename));
  } catch (e) {
    recordTest('Resume Upload', 'Upload Valid PDF Resume (200)', false, e.message);
  }

  // Test 10.2: File Upload Vulnerability - Malicious Extension (.exe / .sh rejected)
  const fakeExePath = path.join(__dirname, 'malicious.exe');
  fs.writeFileSync(fakeExePath, 'MZFakeBinaryPayloadNotAllowed');

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(fakeExePath), {
      filename: 'malicious.exe',
      contentType: 'application/x-msdownload'
    });
    await axios.post(`${BASE_URL}/portfolio/resume/upload`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Security - File Upload', 'Block Dangerous File Type (.exe) (400)', false, 'Uploaded .exe payload');
  } catch (e) {
    recordTest('Security - File Upload', 'Block Dangerous File Type (.exe) (400)', e.response?.status === 400);
  }

  // Test 10.3: Certificate Upload - Valid Image / Document
  const sampleCertPath = path.join(__dirname, 'sample_cert.png');
  fs.writeFileSync(sampleCertPath, '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDRFakeImage');

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(sampleCertPath), {
      filename: 'sample_cert.png',
      contentType: 'image/png'
    });
    const res = await axios.post(`${BASE_URL}/portfolio/certificates/upload`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('Certificate Upload', 'Upload Valid Certificate Document (200)', res.status === 200);
  } catch (e) {
    recordTest('Certificate Upload', 'Upload Valid Certificate Document (200)', false, e.message);
  }

  // Test 10.4: AI Resume Parsing via Server Endpoint (Multer integration + Fallback)
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(samplePdfPath), {
      filename: 'sample_resume.pdf',
      contentType: 'application/pdf'
    });
    const res = await axios.post(`${BASE_URL}/ai/parse-resume`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('AI Resume Parsing', 'Parse Resume Endpoint (200)', res.status === 200 && Boolean(res.data.extracted));
  } catch (e) {
    recordTest('AI Resume Parsing', 'Parse Resume Endpoint (200)', false, e.message);
  }

  // Cleanup temp files
  try {
    if (fs.existsSync(samplePdfPath)) fs.unlinkSync(samplePdfPath);
    if (fs.existsSync(fakeExePath)) fs.unlinkSync(fakeExePath);
    if (fs.existsSync(sampleCertPath)) fs.unlinkSync(sampleCertPath);
  } catch (_) {}

  // ----------------------------------------------------------------
  // 11. AI FEATURES (JD PARSING, MATCH ANALYSIS, CAREER ASSISTANT)
  // ----------------------------------------------------------------
  console.log('\n--- 11. AI FEATURES & RESILIENCE ---');

  // Test 11.1: AI Job Description Parsing (Industry role)
  try {
    const res = await axios.post(`${BASE_URL}/ai/parse-jd`, {
      text: 'Seeking a Data Analyst proficient in SQL, Python, and Power BI with strong communication.'
    }, {
      headers: { Authorization: `Bearer ${tokens.INDUSTRY}` }
    });
    recordTest('AI Job Parsing', 'Parse JD Requirements (200)', res.status === 200 && Array.isArray(res.data.mappedSkills));
  } catch (e) {
    recordTest('AI Job Parsing', 'Parse JD Requirements (200)', false, e.message);
  }

  // Test 11.2: AI Match Semantic Analysis
  try {
    const res = await axios.post(`${BASE_URL}/ai/analyze-match`, {
      resumeText: 'Experienced in SQL database querying, Python data analysis, and building dashboards.',
      jdText: 'Looking for a junior data analyst with SQL and Power BI skills.'
    }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    recordTest('AI Recommendations', 'Semantic Match Analysis (200)', res.status === 200 && Array.isArray(res.data.matching_skills));
  } catch (e) {
    recordTest('AI Recommendations', 'Semantic Match Analysis (200)', false, e.message);
  }

  // Test 11.3: AI Career Assistant (Personalized Guidance)
  try {
    const res = await axios.post(`${BASE_URL}/ai/assistant`, {
      message: 'what skills should i learn for it'
    }, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    const hasRichAdvice = res.data.reply && res.data.reply.length > 100;
    recordTest('AI Recommendations', 'AI Career Assistant Live Guidance (200)', res.status === 200 && hasRichAdvice);
  } catch (e) {
    recordTest('AI Recommendations', 'AI Career Assistant Live Guidance (200)', false, e.message);
  }

  // ----------------------------------------------------------------
  // 12. NOTIFICATIONS & VERIFICATION QUEUE
  // ----------------------------------------------------------------
  console.log('\n--- 12. NOTIFICATIONS & VERIFICATION ---');

  let testNotificationId = null;

  // Test 12.1: Student View Notifications (Expect notification from shortlisting)
  try {
    const res = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` }
    });
    if (res.data.length > 0) testNotificationId = res.data[0].id;
    recordTest('Notifications', 'Fetch Student Notifications (200)', res.status === 200 && Array.isArray(res.data));
  } catch (e) {
    recordTest('Notifications', 'Fetch Student Notifications (200)', false, e.message);
  }

  // Test 12.2: Mark Notification as Read
  if (testNotificationId) {
    try {
      const res = await axios.patch(`${BASE_URL}/notifications/${testNotificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${tokens.STUDENT}` }
      });
      recordTest('Notifications', 'Mark Notification Read (200)', res.status === 200 && res.data.notification?.read === true);
    } catch (e) {
      recordTest('Notifications', 'Mark Notification Read (200)', false, e.message);
    }

    // Test 12.3: IDOR Attack - Student 2 trying to mark Student 1 notification as read (403)
    try {
      await axios.patch(`${BASE_URL}/notifications/${testNotificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${tokens.STUDENT_2}` }
      });
      recordTest('Security - IDOR', 'Cross-User Notification Mark Read (403)', false, 'IDOR vulnerability');
    } catch (e) {
      recordTest('Security - IDOR', 'Cross-User Notification Mark Read (403)', e.response?.status === 403);
    }
  }

  // Test 12.4: Faculty View Verification Queue (/api/student/all)
  try {
    const res = await axios.get(`${BASE_URL}/student/all`, {
      headers: { Authorization: `Bearer ${tokens.FACULTY}` }
    });
    recordTest('Verification', 'Faculty View All Students / Queue (200)', res.status === 200 && res.data.length > 0);
  } catch (e) {
    recordTest('Verification', 'Faculty View All Students / Queue (200)', false, e.message);
  }

  // Test 12.5: Faculty Verify Student Project
  if (projectId) {
    try {
      const res = await axios.patch(`${BASE_URL}/verify/project/${projectId}`, {
        isVerified: true
      }, {
        headers: { Authorization: `Bearer ${tokens.FACULTY}` }
      });
      recordTest('Verification', 'Faculty Verify Project (200)', res.status === 200 && res.data.item?.isVerified === true);
    } catch (e) {
      recordTest('Verification', 'Faculty Verify Project (200)', false, e.message);
    }
  }

  // Test 12.6: Student Attempt to Verify Credentials (403 Forbidden)
  if (projectId) {
    try {
      await axios.patch(`${BASE_URL}/verify/project/${projectId}`, { isVerified: true }, {
        headers: { Authorization: `Bearer ${tokens.STUDENT}` }
      });
      recordTest('Authorization', 'Student Attempt Verification Self-Approve (403)', false, 'Student self-approved credentials');
    } catch (e) {
      recordTest('Authorization', 'Student Attempt Verification Self-Approve (403)', e.response?.status === 403);
    }
  }

  // ----------------------------------------------------------------
  // 13. INSTITUTION & RECRUITER ANALYTICS
  // ----------------------------------------------------------------
  console.log('\n--- 13. ANALYTICS & INSTITUTION DASHBOARD ---');

  // Test 13.1: Institution Overview
  try {
    const res = await axios.get(`${BASE_URL}/analytics/overview`, {
      headers: { Authorization: `Bearer ${tokens.INSTITUTION_ADMIN}` }
    });
    recordTest('Analytics', 'Institution Metrics Overview (200)', res.status === 200 && typeof res.data.metrics?.totalStudents === 'number');
  } catch (e) {
    recordTest('Analytics', 'Institution Metrics Overview (200)', false, e.message);
  }

  // Test 13.2: Industry Demand Analytics
  try {
    const res = await axios.get(`${BASE_URL}/analytics/industry-demand`, {
      headers: { Authorization: `Bearer ${tokens.INSTITUTION_ADMIN}` }
    });
    recordTest('Analytics', 'Industry Demand Analytics (200)', res.status === 200 && Array.isArray(res.data));
  } catch (e) {
    recordTest('Analytics', 'Industry Demand Analytics (200)', false, e.message);
  }

  // Test 13.3: Student Skill Gaps Analytics
  try {
    const res = await axios.get(`${BASE_URL}/analytics/student-gaps`, {
      headers: { Authorization: `Bearer ${tokens.INSTITUTION_ADMIN}` }
    });
    recordTest('Analytics', 'Institutional Student Skill Gaps (200)', res.status === 200 && Array.isArray(res.data));
  } catch (e) {
    recordTest('Analytics', 'Institutional Student Skill Gaps (200)', false, e.message);
  }

  // Test 13.4: Placement Funnel Analytics
  try {
    const res = await axios.get(`${BASE_URL}/analytics/funnel`, {
      headers: { Authorization: `Bearer ${tokens.INSTITUTION_ADMIN}` }
    });
    recordTest('Analytics', 'Institutional Placement Funnel (200)', res.status === 200 && Array.isArray(res.data));
  } catch (e) {
    recordTest('Analytics', 'Institutional Placement Funnel (200)', false, e.message);
  }

  // Test 13.5: Recruiter Recruitment Analytics
  try {
    const res = await axios.get(`${BASE_URL}/analytics/recruiter`, {
      headers: { Authorization: `Bearer ${tokens.INDUSTRY}` }
    });
    recordTest('Analytics', 'Recruiter Funnel & Match Analytics (200)', res.status === 200 && Boolean(res.data.metrics));
  } catch (e) {
    recordTest('Analytics', 'Recruiter Funnel & Match Analytics (200)', false, e.message);
  }

  // ----------------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TEST SUITE SUMMARY: ${results.passed} / ${results.total} PASSED (${Math.round((results.passed / results.total) * 100)}%)`);
  if (results.failed > 0) {
    console.error(`FAILED: ${results.failed} tests.`);
  } else {
    console.log('ALL TESTS PASSED WITH ZERO FAILURES!');
  }
  console.log('================================================================\n');

  // Save report data for TEST_REPORT.md
  fs.writeFileSync(path.join(__dirname, 'test_results.json'), JSON.stringify(results, null, 2));

  await prisma.$disconnect();
  return results;
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
