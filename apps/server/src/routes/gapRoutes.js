const express = require('express');
const { analyzeSkillGap } = require('../controllers/gapController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/analyze', authenticate, authorize('STUDENT'), analyzeSkillGap);
router.get('/analysis', authenticate, authorize('STUDENT'), analyzeSkillGap);

module.exports = router;
