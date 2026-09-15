const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'MONEY_RECEIVED',
        'MONEY_SENT',
        'DEPOSIT_SUCCESS',
        'DEPOSIT_FAILED',
        'WITHDRAWAL_SUCCESS',
        'WITHDRAWAL_FAILED',
        'MONEY_REQUEST_RECEIVED',
        'MONEY_REQUEST_ACCEPTED',
        'MONEY_REQUEST_REJECTED',
        'ACCOUNT_BLOCKED',
        'PASSWORD_CHANGED',
        'SUSPICIOUS_ACTIVITY',
        'GENERAL',
      ],
      default: 'GENERAL',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for fast queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
