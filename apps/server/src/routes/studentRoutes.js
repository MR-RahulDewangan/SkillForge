const express = require('express');
const { getStudentProfile, updateCareerGoal, getResumeData } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile/:id', authenticate, getStudentProfile);
router.get('/resume', authenticate, authorize('STUDENT'), getResumeData);
router.post('/career-goal', authenticate, updateCareerGoal);

module.exports = router;
