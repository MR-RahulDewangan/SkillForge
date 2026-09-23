const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const student = await prisma.student.findFirst({
      where: { userId: userId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        skills: { include: { skill: true } },
        careerGoal: true,
        projects: {
          orderBy: { createdAt: 'desc' }
        },
        certificates: {
          orderBy: { issueDate: 'desc' }
        },
        assessments: {
          orderBy: { startedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Map skill names for assessments
    const skillIds = student.assessments.map(a => a.skillId);
    if (skillIds.length > 0) {
      const skills = await prisma.skill.findMany({
        where: { id: { in: skillIds } },
        select: { id: true, name: true }
      });
      const skillMap = new Map(skills.map(s => [s.id, s.name]));
      student.assessments = student.assessments.map(a => ({
        ...a,
        skill: { name: skillMap.get(a.skillId) || 'Skill' }
      }));
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getResumeData = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await prisma.student.findFirst({
      where: { userId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        careerGoal: true,
        skills: {
          include: { skill: true },
          orderBy: { score: 'desc' }
        },
        projects: {
          orderBy: { createdAt: 'desc' }
        },
        certificates: {
          orderBy: { issueDate: 'desc' }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving resume data', error: error.message });
  }
};

const updateCareerGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { careerGoalId } = req.body;

    if (!careerGoalId || typeof careerGoalId !== 'string') {
      return res.status(400).json({ message: 'Valid careerGoalId is required' });
    }

    const student = await prisma.student.findFirst({ where: { userId } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const role = await prisma.careerRole.findUnique({ where: { id: careerGoalId } });
    if (!role) return res.status(404).json({ message: 'Career role not found' });

    await prisma.student.update({
      where: { id: student.id },
      data: { careerGoalId }
    });
    res.json({ message: 'Career goal updated successfully', role: role.title });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        careerGoal: true,
        skills: { include: { skill: true } },
        projects: true,
        certificates: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving students', error: error.message });
  }
};

module.exports = { getStudentProfile, getResumeData, updateCareerGoal, getAllStudents };
