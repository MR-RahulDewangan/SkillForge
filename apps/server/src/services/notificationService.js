const crypto = require('crypto');

// In-memory persistent notification store mapped by userId
const notificationsStore = new Map();

/**
 * Creates a notification for a specific user
 */
const createNotification = (userId, { title, message, type = 'INFO', metadata = {} }) => {
  if (!userId) return null;
  const userList = notificationsStore.get(userId) || [];
  const notification = {
    id: crypto.randomUUID(),
    userId,
    title,
    message,
    type, // 'INFO', 'SUCCESS', 'WARNING', 'APPLICATION_STATUS', 'VERIFICATION'
    read: false,
    metadata,
    createdAt: new Date().toISOString()
  };

  userList.unshift(notification);
  // Keep last 50 notifications per user
  if (userList.length > 50) userList.pop();
  notificationsStore.set(userId, userList);
  return notification;
};

/**
 * Gets all notifications for a user
 */
const getUserNotifications = (userId) => {
  return notificationsStore.get(userId) || [];
};

/**
 * Marks a notification as read with strict IDOR verification
 */
const markAsRead = (userId, notificationId) => {
  const userList = notificationsStore.get(userId) || [];
  const notif = userList.find(n => n.id === notificationId);
  if (!notif) return null;
  notif.read = true;
  return notif;
};

/**
 * Checks if notification exists under ANY user (to distinguish 404 from 403 IDOR)
 */
const findNotificationGlobal = (notificationId) => {
  for (const [uid, list] of notificationsStore.entries()) {
    const found = list.find(n => n.id === notificationId);
    if (found) return { notification: found, ownerUserId: uid };
  }
  return null;
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  findNotificationGlobal
};
