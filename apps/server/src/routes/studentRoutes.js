const express = require('express');
const { getStudentProfile, updateCareerGoal, getResumeData, getAllStudents } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/all', authenticate, authorize('FACULTY', 'INSTITUTION_ADMIN'), getAllStudents);
router.get('/profile/:id', authenticate, getStudentProfile);
router.get('/resume', authenticate, authorize('STUDENT'), getResumeData);
router.post('/career-goal', authenticate, authorize('STUDENT'), updateCareerGoal);

module.exports = router;
