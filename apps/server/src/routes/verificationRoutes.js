const express = require('express');
const { verifyItem } = require('../controllers/verificationController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.patch('/:type/:id', authenticate, authorize('FACULTY', 'INSTITUTION_ADMIN'), verifyItem);
router.patch('/verify/:type/:id', authenticate, authorize('FACULTY', 'INSTITUTION_ADMIN'), verifyItem);

module.exports = router;
