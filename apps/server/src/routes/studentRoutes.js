const express = require('express');
const { getStudentProfile, updateCareerGoal } = require('../controllers/studentController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile/:id', authenticate, getStudentProfile);
router.post('/career-goal', authenticate, updateCareerGoal);

module.exports = router;
