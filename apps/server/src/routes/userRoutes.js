const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user, message: 'Authenticated successfully' });
});

router.get('/admin-only', authenticate, authorize('INSTITUTION_ADMIN'), (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

module.exports = router;
