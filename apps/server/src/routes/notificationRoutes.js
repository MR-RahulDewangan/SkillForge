const express = require('express');
const { getNotifications, markNotificationRead } = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markNotificationRead);

module.exports = router;
