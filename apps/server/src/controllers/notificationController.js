const { 
  getUserNotifications, 
  markAsRead, 
  findNotificationGlobal 
} = require('../services/notificationService');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    const globalCheck = findNotificationGlobal(id);
    if (!globalCheck) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // IDOR Check: user must own this notification
    if (globalCheck.ownerUserId !== userId && req.user.role !== 'INSTITUTION_ADMIN') {
      return res.status(403).json({ message: 'Forbidden: You cannot modify notifications of another user' });
    }

    const updated = markAsRead(userId, id);
    res.json({ message: 'Notification marked as read', notification: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead
};
