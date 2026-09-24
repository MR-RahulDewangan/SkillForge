const axios = require('axios');
const http = require('http');
const express = require('express');
const cors = require('cors');

// Ensure correct env is loaded
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const authRoutes = require('../src/routes/authRoutes');
const userRoutes = require('../src/routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

const TEST_PORT = 5099;

const testAccounts = [
  // Student Accounts
  { email: 'stu001@student.edu', role: 'STUDENT', name: 'Aarav Sharma' },
  { email: 'stu002@student.edu', role: 'STUDENT', name: 'Priya Verma' },
  { email: 'stu003@student.edu', role: 'STUDENT', name: 'Rohan Patel' },
  { email: 'stu004@student.edu', role: 'STUDENT', name: 'Ananya Iyer' },
  { email: 'stu005@student.edu', role: 'STUDENT', name: 'Vikram Malhotra' },
  { email: 'stu006@student.edu', role: 'STUDENT', name: 'Neha Singh' },
  // Industry Accounts
  { email: 'contact@comp001.example.com', role: 'INDUSTRY', name: 'NexaTech Systems' },
  { email: 'contact@comp002.example.com', role: 'INDUSTRY', name: 'DataPulse Analytics' },
  { email: 'contact@comp003.example.com', role: 'INDUSTRY', name: 'CloudScale Labs' },
  { email: 'contact@comp004.example.com', role: 'INDUSTRY', name: 'Apex Digital FinTech' },
  // Admin & Faculty Accounts
  { email: 'admin@institution.edu', role: 'INSTITUTION_ADMIN', name: 'Institution Admin' },
  { email: 'faculty1@university.edu', role: 'FACULTY', name: 'Prof. Sharma' }
];

async function run() {
  const server = app.listen(TEST_PORT, async () => {
    console.log(`Test server running on port ${TEST_PORT}\n`);
    let passCount = 0;
    let failCount = 0;

    for (const acc of testAccounts) {
      try {
        const res = await axios.post(`http://localhost:${TEST_PORT}/api/auth/login`, {
          email: acc.email,
          password: 'password123'
        });

        if (res.status === 200 && res.data.token && res.data.user.role === acc.role) {
          console.log(`[PASS] ${acc.email} (${acc.role}): Login successful! Token issued. Name: ${res.data.user.firstName} ${res.data.user.lastName}`);
          passCount++;
        } else {
          console.log(`[FAIL] ${acc.email}: Unexpected response ${res.status}`);
          failCount++;
        }
      } catch (err) {
        console.log(`[FAIL] ${acc.email}: ${err.response?.status} - ${JSON.stringify(err.response?.data || err.message)}`);
        failCount++;
      }
    }

    console.log(`\n========================================`);
    console.log(`RESULTS: ${passCount} PASSED, ${failCount} FAILED out of ${testAccounts.length}`);
    console.log(`========================================\n`);

    server.close();
    process.exit(failCount > 0 ? 1 : 0);
  });
}

run();
