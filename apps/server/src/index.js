require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const studentRoutes = require('./routes/studentRoutes');
const gapRoutes = require('./routes/gapRoutes');
const companyRoutes = require('./routes/companyRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/gap', gapRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/notifications', notificationRoutes);

// Root landing info
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'SkillForge Backend API (SIH 2026)',
    version: '1.0.0',
    message: 'Backend server is operational. Connect the web frontend using this URL.',
    healthCheck: '/health',
    repository: 'https://github.com/MR-RahulDewangan/SkillForge'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
