const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const parseResume = async (req, res) => {
  try {
    // In a real app, we'd use multer to handle the file upload
    // For the sake of this implementation, we assume the frontend sends a multipart request
    // We proxy the file to the AI service
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', req.file.buffer, req.file.originalname);

    const response = await axios.post(`${AI_SERVICE_URL}/parse-resume`, form, {
      headers: form.getHeaders()
    });

    const extracted = response.data;

    // Map extracted skills to existing skills table
    const mappedSkills = [];
    for (const skillName of extracted.skills) {
      const skill = await prisma.skill.findFirst({
        where: { name: { contains: skillName, mode: 'insensitive' } }
      });
      if (skill) mappedSkills.push(skill);
    }

    res.json({
      extracted,
      mappedSkills
    });
  } catch (error) {
    res.status(500).json({ message: 'AI Parsing Error', error: error.message });
  }
};

const parseJD = async (req, res) => {
  try {
    const { text } = req.body;
    const formData = new URLSearchParams();
    formData.append('text', text);

    const response = await axios.post(`${AI_SERVICE_URL}/parse-jd`, formData);
    const extracted = response.data;

    const mappedSkills = [];
    for (const skillName of [...extracted.technical_skills, ...extracted.soft_skills]) {
      const skill = await prisma.skill.findFirst({
        where: { name: { contains: skillName, mode: 'insensitive' } }
      });
      if (skill) mappedSkills.push(skill);
    }

    res.json({ extracted, mappedSkills });
  } catch (error) {
    res.status(500).json({ message: 'AI Parsing Error', error: error.message });
  }
};

const analyzeMatch = async (req, res) => {
  try {
    const { resumeText, jdText } = req.body;
    const formData = new URLSearchParams();
    formData.append('resume_text', resumeText);
    formData.append('jd_text', jdText);

    const response = await axios.post(`${AI_SERVICE_URL}/analyze-match`, formData);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'AI Analysis Error', error: error.message });
  }
};

const askAssistant = async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user.id;

    const student = await prisma.student.findFirst({
      where: { userId },
      include: {
        careerGoal: true,
        skills: { include: { skill: true } },
        assessments: { include: { skill: { select: { name: true } } } }
      }
    });

    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const context = JSON.stringify({
      goal: student.careerGoal?.title,
      skills: student.skills.map(s => ({ name: s.skill.name, score: s.score })),
      recentAssessments: student.assessments.map(a => ({ skill: a.skill.name, score: a.score }))
    });

    const formData = new URLSearchParams();
    formData.append('query', query);
    formData.append('context', context);

    const response = await axios.post(`${AI_SERVICE_URL}/career-assistant`, formData);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'AI Assistant Error', error: error.message });
  }
};

module.exports = { parseResume, parseJD, analyzeMatch, askAssistant };
