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

const buildPersonalizedGuidance = (query, student, roleSkills, recommendedCourses) => {
  const q = (query || '').toLowerCase();
  const goalTitle = student.careerGoal?.title || 'Data Analyst';
  const studentSkillMap = new Map(student.skills.map(s => [s.skillId, { name: s.skill.name, score: s.score }]));

  const skillsWithStatus = roleSkills.map(rs => {
    const s = studentSkillMap.get(rs.skillId);
    const score = s ? s.score : 0;
    return {
      name: rs.skill.name,
      required: rs.minRequiredScore,
      score: score,
      isSatisfied: score >= rs.minRequiredScore,
      gap: Math.max(0, rs.minRequiredScore - score)
    };
  });

  const satisfied = skillsWithStatus.filter(s => s.isSatisfied);
  const deficits = skillsWithStatus.filter(s => !s.isSatisfied);
  const allRequiredNames = skillsWithStatus.length > 0 ? skillsWithStatus.map(s => s.name) : ['SQL', 'Python', 'Power BI', 'Statistics', 'Communication'];

  // 1. Skill & Learning intent
  if (q.includes('skill') || q.includes('learn') || q.includes('study') || q.includes('prepare') || q.includes('what') || q.includes('need') || q.includes('require')) {
    let answer = `To excel as a **${goalTitle}**, here are the exact core skills and tools you should focus on:\n\n`;
    answer += `### 1. Essential Technical & Analytical Skills for ${goalTitle}:\n`;
    
    const skillDescriptions = {
      'SQL': 'Relational databases, complex multi-table JOINs, window functions, aggregations, and CTEs.',
      'Python': 'Data manipulation with Pandas, numerical analysis with NumPy, and scripting data pipelines.',
      'Power BI': 'Interactive executive dashboards, KPI visualization, data modeling, and DAX calculations.',
      'Statistics': 'Descriptive & inferential statistics, hypothesis testing, probability, and distribution analysis.',
      'Communication': 'Data storytelling, translating quantitative metrics into actionable business recommendations.'
    };

    allRequiredNames.forEach(skName => {
      const desc = skillDescriptions[skName] || 'Core domain proficiency required by hiring employers.';
      answer += `• **${skName}**: ${desc}\n`;
    });

    answer += `\n### 2. Your Profile Status for ${goalTitle}:\n`;
    if (satisfied.length > 0) {
      answer += `• ✅ **Verified Strengths**: ${satisfied.map(s => `${s.name} (${s.score}%)`).join(', ')}\n`;
    }
    if (deficits.length > 0) {
      answer += `• ⚠️ **Priority Gaps to Learn/Improve**: ${deficits.map(s => `${s.name} (Current: ${s.score}%, Target: ${s.required}%)`).join(', ')}\n`;
    } else {
      answer += `• 🌟 **All required skills satisfied!** You are in a strong position for internship and full-time hiring.\n`;
    }

    if (recommendedCourses && recommendedCourses.length > 0) {
      answer += `\n### 3. Recommended Courses to Bridge Deficits:\n`;
      recommendedCourses.forEach(c => {
        answer += `• **${c.title}** (${c.provider}) — [Start Course](${c.url || '#'})\n`;
      });
    }

    answer += `\n💡 **Actionable Next Step**: Take an assessment in the Assessment Center for your priority deficit skills to update your verified profile and raise your match score for recruiter ATS!`;
    return answer;
  }

  // 2. Project / Portfolio intent
  if (q.includes('project') || q.includes('portfolio') || q.includes('build') || q.includes('capstone')) {
    let answer = `For a **${goalTitle}** role, recruiters look for projects that prove real-world problem-solving:\n\n`;
    answer += `• **E-Commerce Cohort Retention Engine**: Write SQL queries on transaction logs, clean data with Python Pandas, and visualize customer churn.\n`;
    answer += `• **Executive Sales & Revenue BI Dashboard**: Build an interactive Power BI dashboard with drill-down filters, KPI cards, and trend analysis.\n`;
    answer += `• **Exploratory Data Analysis (EDA) Capstone**: Take an untidy public dataset (Kaggle/government data), perform statistical imputation, and publish insights.\n\n`;
    answer += `Upload these to your **Digital Portfolio** to earn the 'Portfolio Builder' milestone badge!`;
    return answer;
  }

  // 3. Resume / Job search intent
  if (q.includes('resume') || q.includes('job') || q.includes('interview') || q.includes('apply')) {
    return `For **${goalTitle}** positions, tailor your ATS resume to emphasize your verified skills (${allRequiredNames.join(', ')}). Use the portal's **ATS Resume Builder** to generate a single-page verified PDF with your project links and assessment scores!`;
  }

  // Default context-aware guidance
  return `As an aspiring **${goalTitle}**, your key competencies are ${allRequiredNames.join(', ')}. In your profile, you have ${satisfied.length} skills meeting industry benchmark. Keep practicing in the Assessment Center and check your Skill Gap dashboard to bridge any remaining deficits!`;
};

const askAssistant = async (req, res) => {
  try {
    const query = req.body.query || req.body.message || '';
    const userId = req.user.id;

    const student = await prisma.student.findFirst({
      where: { userId },
      include: {
        careerGoal: {
          include: {
            skills: {
              include: { skill: true }
            }
          }
        },
        skills: { include: { skill: true } },
        projects: true,
        certificates: true,
        assessments: {
          orderBy: { startedAt: 'desc' },
          take: 5
        }
      }
    });

    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const roleSkills = student.careerGoal?.skills || [];
    const studentSkillMap = new Map(student.skills.map(s => [s.skillId, { name: s.skill.name, score: s.score }]));

    const deficitSkillIds = roleSkills.filter(rs => {
      const s = studentSkillMap.get(rs.skillId);
      return !s || s.score < rs.minRequiredScore;
    }).map(rs => rs.skillId);

    const recommendedCourses = await prisma.course.findMany({
      where: { skillId: { in: deficitSkillIds } },
      include: { skill: true },
      take: 3
    });

    const useAi = req.body.useAi !== false && process.env.ENABLE_AI !== 'false';

    if (!useAi) {
      const reply = buildPersonalizedGuidance(query, student, roleSkills, recommendedCourses);
      return res.json({ reply, source: 'rule-based-advisor' });
    }

    try {
      const context = JSON.stringify({
        goal: student.careerGoal?.title || 'Data Analyst',
        requiredSkills: roleSkills.map(rs => ({ name: rs.skill.name, requiredScore: rs.minRequiredScore })),
        studentSkills: student.skills.map(s => ({ name: s.skill.name, score: s.score })),
        recommendedCourses: recommendedCourses.map(c => ({ title: c.title, provider: c.provider, url: c.url }))
      });

      const formData = new URLSearchParams();
      formData.append('query', query);
      formData.append('context', context);

      const response = await axios.post(`${AI_SERVICE_URL}/career-assistant`, formData, { timeout: 25000 });
      const answer = response.data?.answer || response.data?.reply;
      
      // If AI service returned a generic fallback message, replace it with our rich personalized guidance
      if (!answer || answer.includes('focusing on improving your assessed skill scores and completing recommended courses will directly')) {
        const enrichedReply = buildPersonalizedGuidance(query, student, roleSkills, recommendedCourses);
        return res.json({ reply: enrichedReply, source: 'personalized-advisor' });
      }

      return res.json({ reply: answer, source: 'gemini-ai' });
    } catch (aiErr) {
      const reply = buildPersonalizedGuidance(query, student, roleSkills, recommendedCourses);
      return res.json({ reply, source: 'fallback-assistant' });
    }
  } catch (error) {
    res.status(500).json({ message: 'AI Assistant Error', error: error.message });
  }
};

module.exports = { parseResume, parseJD, analyzeMatch, askAssistant };
