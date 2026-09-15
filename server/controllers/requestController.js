const mongoose = require('mongoose');
const MoneyRequest = require('../models/MoneyRequest');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationHelper');
const { createAuditLog } = require('../utils/auditHelper');
const generateTransactionId = require('../utils/generateTransactionId');

// @desc    Create money request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res, next) => {
  try {
    const { recipientId, amount, note } = req.body;
    const requestAmount = parseFloat(amount);

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot request money from yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient || recipient.isBlocked) {
      return res.status(404).json({ success: false, message: 'Recipient not found or unavailable' });
    }

    const moneyRequest = await MoneyRequest.create({
      requester: req.user._id,
      recipient: recipientId,
      amount: requestAmount,
      note: note || '',
      status: 'PENDING',
    });

    await createNotification({
      userId: recipientId,
      title: 'Money Request Received 📨',
      message: `${req.user.name} is requesting ₹${requestAmount.toLocaleString('en-IN')} from you. ${note ? `Note: ${note}` : ''}`,
      type: 'MONEY_REQUEST_RECEIVED',
    });

    await createAuditLog({
      userId: req.user._id,
      action: 'MONEY_REQUEST',
      description: `Requested ₹${requestAmount} from ${recipient.email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      message: 'Money request sent successfully',
      data: moneyRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get money requests (sent and received)
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res, next) => {
  try {
    const { type = 'all', status } = req.query;
    let query = {};

    if (type === 'sent') {
      query.requester = req.user._id;
    } else if (type === 'received') {
      query.recipient = req.user._id;
    } else {
      query.$or = [{ requester: req.user._id }, { recipient: req.user._id }];
    }

    if (status) query.status = status;

    const requests = await MoneyRequest.find(query)
      .populate('requester', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept money request
// @route   PUT /api/requests/:id/accept
// @access  Private
const acceptRequest = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const moneyRequest = await MoneyRequest.findById(req.params.id).session(session);

    if (!moneyRequest) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (moneyRequest.recipient.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: 'Not authorized to accept this request' });
    }

    if (moneyRequest.status !== 'PENDING') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: `Request is already ${moneyRequest.status}` });
    }

    if (moneyRequest.expiresAt < new Date()) {
      moneyRequest.status = 'EXPIRED';
      await moneyRequest.save({ session });
      await session.commitTransaction();
      return res.status(400).json({ success: false, message: 'This request has expired' });
    }

    const payerWallet = await Wallet.findOne({ userId: req.user._id }).session(session);
    if (!payerWallet || payerWallet.status !== 'active') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Your wallet is not active' });
    }

    if (payerWallet.balance < moneyRequest.amount) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Insufficient balance to accept this request' });
    }

    const requesterWallet = await Wallet.findOne({ userId: moneyRequest.requester }).session(session);
    if (!requesterWallet || requesterWallet.status !== 'active') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Requester wallet is not active' });
    }

    const txnId = generateTransactionId();

    // Transfer
    payerWallet.balance -= moneyRequest.amount;
    payerWallet.totalSent += moneyRequest.amount;
    await payerWallet.save({ session });

    requesterWallet.balance += moneyRequest.amount;
    requesterWallet.totalReceived += moneyRequest.amount;
    await requesterWallet.save({ session });

    await Transaction.create([{
      transactionId: txnId,
      sender: req.user._id,
      receiver: moneyRequest.requester,
      wallet: payerWallet._id,
      type: 'TRANSFER',
      amount: moneyRequest.amount,
      status: 'COMPLETED',
      description: `Money request payment: ${moneyRequest.note || ''}`,
      reference: moneyRequest._id.toString(),
    }], { session });

    await Transaction.create([{
      transactionId: generateTransactionId(),
      sender: req.user._id,
      receiver: moneyRequest.requester,
      wallet: requesterWallet._id,
      type: 'RECEIVED',
      amount: moneyRequest.amount,
      status: 'COMPLETED',
      description: `Money request fulfilled by ${req.user.name}: ${moneyRequest.note || ''}`,
      reference: txnId,
    }], { session });

    moneyRequest.status = 'ACCEPTED';
    moneyRequest.transactionId = txnId;
    await moneyRequest.save({ session });

    await session.commitTransaction();

    // Notifications
    await createNotification({
      userId: moneyRequest.requester.toString(),
      title: 'Money Request Accepted 🎉',
      message: `${req.user.name} accepted your request and sent ₹${moneyRequest.amount.toLocaleString('en-IN')}.`,
      type: 'MONEY_REQUEST_ACCEPTED',
    });

    await createNotification({
      userId: req.user._id,
      title: 'Money Request Paid',
      message: `You paid ₹${moneyRequest.amount.toLocaleString('en-IN')} as requested.`,
      type: 'MONEY_SENT',
    });

    res.json({ success: true, message: 'Request accepted and payment processed' });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Reject money request
// @route   PUT /api/requests/:id/reject
// @access  Private
const rejectRequest = async (req, res, next) => {
  try {
    const moneyRequest = await MoneyRequest.findById(req.params.id);

    if (!moneyRequest) return res.status(404).json({ success: false, message: 'Request not found' });

    if (moneyRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (moneyRequest.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Request is already ${moneyRequest.status}` });
    }

    moneyRequest.status = 'REJECTED';
    await moneyRequest.save();

    await createNotification({
      userId: moneyRequest.requester.toString(),
      title: 'Money Request Rejected',
      message: `${req.user.name} rejected your money request of ₹${moneyRequest.amount.toLocaleString('en-IN')}.`,
      type: 'MONEY_REQUEST_REJECTED',
    });

    res.json({ success: true, message: 'Request rejected' });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel money request (by requester)
// @route   PUT /api/requests/:id/cancel
// @access  Private
const cancelRequest = async (req, res, next) => {
  try {
    const moneyRequest = await MoneyRequest.findById(req.params.id);

    if (!moneyRequest) return res.status(404).json({ success: false, message: 'Request not found' });

    if (moneyRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (moneyRequest.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Request cannot be cancelled — already ${moneyRequest.status}` });
    }

    moneyRequest.status = 'CANCELLED';
    await moneyRequest.save();

    res.json({ success: true, message: 'Request cancelled' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRequest, getRequests, acceptRequest, rejectRequest, cancelRequest };
