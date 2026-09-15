const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 */
const createAuditLog = async ({ userId = null, adminId = null, action, description, ipAddress = '', userAgent = '', metadata = {} }) => {
  try {
    await AuditLog.create({ userId, adminId, action, description, ipAddress, userAgent, metadata });
  } catch (error) {
    console.error('Audit log creation failed:', error.message);
  }
};

module.exports = { createAuditLog };
