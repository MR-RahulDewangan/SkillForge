const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const student = await prisma.student.findFirst({
      where: { userId: userId },
      include: {
        skills: { include: { skill: true } },
        careerGoal: true,
        assessments: {
          orderBy: { startedAt: 'desc' },
          take: 10,
          include: { skill: { select: { name: true } } }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateCareerGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { careerGoalId } = req.body;

    const student = await prisma.student.findFirst({ where: { userId } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    await prisma.student.update({
      where: { id: student.id },
      data: { careerGoalId }
    });
    res.json({ message: 'Career goal updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStudentProfile, updateCareerGoal };
