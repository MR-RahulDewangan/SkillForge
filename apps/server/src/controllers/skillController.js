const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSkillsByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await prisma.careerRole.findUnique({
      where: { id: roleId },
      include: {
        skills: {
          include: { skill: true }
        }
      }
    });
    
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role.skills.map(rs => ({ ...rs.skill, minRequiredScore: rs.minRequiredScore })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.careerRole.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSkillsByRole, getAllRoles };
