const express = require('express');
const { autoFillProfile } = require('../controllers/resumeController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/autofill', authenticate, authorize('STUDENT'), autoFillProfile);

module.exports = router;
