const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 */
const createNotification = async ({ userId, title, message, type = 'GENERAL', link = '' }) => {
  try {
    await Notification.create({ userId, title, message, type, link });
  } catch (error) {
    console.error('Notification creation failed:', error.message);
  }
};

module.exports = { createNotification };
