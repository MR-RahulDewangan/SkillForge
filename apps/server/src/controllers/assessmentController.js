const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getQuestions = async (req, res) => {
  try {
    const { skillId } = req.params;
    const questions = await prisma.assessmentQuestion.findMany({
      where: { skillId },
      select: { id: true, questionText: true, options: true } // Do not send correctOption
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const submitAssessment = async (req, res) => {
  try {
    const { skillId, answers } = req.body; // answers: [{questionId, answerIndex}]
    const userId = req.user.id;
    
    // 1. Find the student profile associated with the user
    const student = await prisma.student.findFirst({
      where: { userId: userId }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const questions = await prisma.assessmentQuestion.findMany({
      where: { skillId },
      select: { id: true, correctOption: true }
    });

    let correctCount = 0;
    questions.forEach(q => {
      const userAns = answers.find(a => a.questionId === q.id);
      if (userAns && userAns.answerIndex === q.correctOption) {
        correctCount++;
      }
    });

    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    // 2. Record attempt
    await prisma.assessmentAttempt.create({
      data: { 
        studentId: student.id, 
        skillId, 
        score 
      }
    });

    // 3. Update student skill profile (use highest score achieved)
    const existingSkill = await prisma.studentSkill.findUnique({
      where: { studentId_skillId: { studentId: student.id, skillId } }
    });

    if (existingSkill) {
      if (score > existingSkill.score) {
        await prisma.studentSkill.update({
          where: { id: existingSkill.id },
          data: { score }
        });
      }
    } else {
      await prisma.studentSkill.create({
        data: { studentId: student.id, skillId, score }
      });
    }

    res.json({ score, message: 'Assessment submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getQuestions, submitAssessment };
