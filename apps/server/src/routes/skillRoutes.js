const express = require('express');
const { getSkillsByRole, getAllRoles } = require('../controllers/skillController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/roles', authenticate, getAllRoles);
router.get('/roles/all', authenticate, async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.get('/roles/:roleId/skills', authenticate, getSkillsByRole);

module.exports = router;
