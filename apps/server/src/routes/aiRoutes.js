const express = require('express');
const { parseResume, parseJD, analyzeMatch, askAssistant } = require('../controllers/aiController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { uploadResumeMemory } = require('../middleware/uploadMiddleware');
const router = express.Router();

// Multer wrapper with clean error response
const handleResumeUpload = (req, res, next) => {
  uploadResumeMemory.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload error' });
    }
    next();
  });
};

router.post('/parse-resume', authenticate, handleResumeUpload, parseResume);
router.post('/parse-jd', authenticate, authorize('INDUSTRY'), parseJD);
router.post('/analyze-match', authenticate, analyzeMatch);
router.post('/assistant', authenticate, authorize('STUDENT'), askAssistant);
router.post('/guidance', authenticate, authorize('STUDENT'), askAssistant);

module.exports = router;
