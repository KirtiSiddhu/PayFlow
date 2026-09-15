const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    type: {
      type: String,
      enum: ['DEPOSIT', 'TRANSFER', 'RECEIVED', 'WITHDRAWAL', 'REFUND', 'REQUEST'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be at least ₹1'],
    },
    fee: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },
    description: {
      type: String,
      default: '',
    },
    reference: {
      type: String,
      default: '',
    },
    metadata: {
      paymentMethod: String,
      ipAddress: String,
      userAgent: String,
      note: String,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent modification of completed transactions
transactionSchema.pre('save', function (next) {
  if (!this.isNew && this.isModified('amount')) {
    return next(new Error('Transaction amount cannot be modified'));
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
