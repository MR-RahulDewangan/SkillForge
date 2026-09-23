const express = require('express');
const { getQuestions, submitAssessment } = require('../controllers/assessmentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/questions/:skillId', authenticate, getQuestions);
router.post('/submit', authenticate, authorize('STUDENT'), submitAssessment);

module.exports = router;
