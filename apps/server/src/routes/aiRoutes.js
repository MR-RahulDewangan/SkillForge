const express = require('express');
const { parseResume, parseJD, analyzeMatch, askAssistant } = require('../controllers/aiController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// Note: For file uploads, you would normally use multer here
router.post('/parse-resume', authenticate, parseResume);
router.post('/parse-jd', authenticate, authorize('INDUSTRY'), parseJD);
router.post('/analyze-match', authenticate, analyzeMatch);
router.post('/assistant', authenticate, authorize('STUDENT'), askAssistant);

module.exports = router;
