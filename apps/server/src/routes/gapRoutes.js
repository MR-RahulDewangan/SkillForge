const express = require('express');
const { analyzeSkillGap } = require('../controllers/gapController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/analyze', authenticate, analyzeSkillGap);
router.get('/analysis', authenticate, analyzeSkillGap);

module.exports = router;
