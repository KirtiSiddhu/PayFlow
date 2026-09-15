const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'REGISTER',
        'PASSWORD_CHANGE',
        'WALLET_FREEZE',
        'WALLET_UNFREEZE',
        'USER_BLOCK',
        'USER_UNBLOCK',
        'TRANSACTION_CREATE',
        'TRANSACTION_FAIL',
        'DEPOSIT',
        'WITHDRAWAL',
        'TRANSFER',
        'MONEY_REQUEST',
        'ADMIN_ACTION',
        'LOGOUT_ALL_SESSIONS',
        'PROFILE_UPDATE',
        'ADMIN_CREATED',
        'ADMIN_DELETED',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for fast admin queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
