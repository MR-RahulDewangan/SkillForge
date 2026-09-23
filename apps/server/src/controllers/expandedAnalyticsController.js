const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDepartmentAnalytics = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { skills: true }
    });

    const deptMap = {};
    students.forEach(s => {
      const branch = s.branch || 'Unknown';
      if (!deptMap[branch]) {
        deptMap[branch] = { 
          count: 0, 
          avgScore: 0, 
          totalScore: 0, 
          assessed: 0 
        };
      }
      deptMap[branch].count++;
      if (s.skills.length > 0) {
        deptMap[branch].assessed++;
        const avg = s.skills.reduce((acc, curr) => acc + curr.score, 0) / s.skills.length;
        deptMap[branch].totalScore += avg;
      }
    });

    const result = Object.entries(deptMap).map(([branch, data]) => ({
      branch,
      totalStudents: data.count,
      assessedStudents: data.assessed,
      avgSkillScore: Math.round(data.totalScore / (data.assessed || 1))
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Dept analytics error', error: error.message });
  }
};

module.exports = { getDepartmentAnalytics };
