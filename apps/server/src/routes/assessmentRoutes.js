const express = require('express');
const { getQuestions, submitAssessment } = require('../controllers/assessmentController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/questions/:skillId', authenticate, getQuestions);
router.post('/submit', authenticate, submitAssessment);

module.exports = router;
