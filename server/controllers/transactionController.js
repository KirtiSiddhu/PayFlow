const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationHelper');
const { createAuditLog } = require('../utils/auditHelper');
const generateTransactionId = require('../utils/generateTransactionId');

// @desc    Send money to another user
// @route   POST /api/transactions/send
// @access  Private
const sendMoney = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { recipientId, amount, note } = req.body;
    const sendAmount = parseFloat(amount);

    // Prevent self-transfer
    if (recipientId === req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'You cannot send money to yourself' });
    }

    // Validate recipient
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    if (recipient.isBlocked) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Cannot send money to a blocked user' });
    }

    // Get sender wallet
    const senderWallet = await Wallet.findOne({ userId: req.user._id }).session(session);
    if (!senderWallet) throw new Error('Sender wallet not found');

    if (senderWallet.status !== 'active') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: `Your wallet is ${senderWallet.status}. Cannot send money.` });
    }

    if (senderWallet.balance < sendAmount) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    // Get recipient wallet
    const recipientWallet = await Wallet.findOne({ userId: recipientId }).session(session);
    if (!recipientWallet) throw new Error('Recipient wallet not found');

    if (recipientWallet.status !== 'active') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: `Recipient's wallet is not active` });
    }

    const txnId = generateTransactionId();

    // Deduct from sender
    senderWallet.balance -= sendAmount;
    senderWallet.totalSent += sendAmount;
    await senderWallet.save({ session });

    // Add to recipient
    recipientWallet.balance += sendAmount;
    recipientWallet.totalReceived += sendAmount;
    await recipientWallet.save({ session });

    // Create TRANSFER record for sender
    const [senderTxn] = await Transaction.create([{
      transactionId: txnId,
      sender: req.user._id,
      receiver: recipientId,
      wallet: senderWallet._id,
      type: 'TRANSFER',
      amount: sendAmount,
      status: 'COMPLETED',
      description: note || `Money sent to ${recipient.name}`,
      metadata: { note },
    }], { session });

    // Create RECEIVED record for recipient
    await Transaction.create([{
      transactionId: generateTransactionId(),
      sender: req.user._id,
      receiver: recipientId,
      wallet: recipientWallet._id,
      type: 'RECEIVED',
      amount: sendAmount,
      status: 'COMPLETED',
      description: note || `Money received from ${req.user.name}`,
      reference: txnId,
      metadata: { note },
    }], { session });

    await session.commitTransaction();

    // Notifications
    await createNotification({
      userId: req.user._id,
      title: 'Money Sent ✅',
      message: `₹${sendAmount.toLocaleString('en-IN')} sent to ${recipient.name} successfully.`,
      type: 'MONEY_SENT',
    });

    await createNotification({
      userId: recipientId,
      title: 'Money Received 💰',
      message: `You received ₹${sendAmount.toLocaleString('en-IN')} from ${req.user.name}.`,
      type: 'MONEY_RECEIVED',
    });

    await createAuditLog({
      userId: req.user._id,
      action: 'TRANSFER',
      description: `Sent ₹${sendAmount} to ${recipient.email} (${txnId})`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: `₹${sendAmount.toLocaleString('en-IN')} sent to ${recipient.name} successfully!`,
      data: { transactionId: txnId },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Get transaction history
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sort = 'newest',
    } = req.query;

    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });

    const query = { wallet: wallet._id };

    if (type) query.type = type;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { amount: -1 },
      lowest: { amount: 1 },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      wallet: wallet._id,
    })
      .populate('sender', 'name email phone')
      .populate('receiver', 'name email phone');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMoney, getTransactions, getTransaction };
