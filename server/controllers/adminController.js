const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { createNotification } = require('../utils/notificationHelper');
const { createAuditLog } = require('../utils/auditHelper');
const generateWalletId = require('../utils/generateWalletId');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      totalTransactions,
      pendingTransactions,
      failedTransactions,
      flaggedTransactions,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isBlocked: false }),
      User.countDocuments({ role: 'user', isBlocked: true }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'PENDING' }),
      Transaction.countDocuments({ status: 'FAILED' }),
      Transaction.countDocuments({ isFlagged: true }),
    ]);

    // Total wallet balance across all users
    const walletStats = await Wallet.aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$balance' }, totalReceived: { $sum: '$totalReceived' }, totalSent: { $sum: '$totalSent' } } },
    ]);

    // Transaction volume
    const txnVolume = await Transaction.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, volume: { $sum: '$amount' } } },
    ]);

    // Daily transactions for chart (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyTransactions = await Transaction.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          volume: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User registrations by day
    const userRegistrations = await User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Transaction type breakdown
    const txnByType = await Transaction.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    ]);

    // Success vs failed
    const txnByStatus = await Transaction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers, blocked: blockedUsers },
        transactions: {
          total: totalTransactions,
          pending: pendingTransactions,
          failed: failedTransactions,
          flagged: flaggedTransactions,
          volume: txnVolume[0]?.volume || 0,
          byType: txnByType,
          byStatus: txnByStatus,
          daily: dailyTransactions,
        },
        wallet: walletStats[0] || { totalBalance: 0, totalReceived: 0, totalSent: 0 },
        charts: { userRegistrations, dailyTransactions },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, role = 'user' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { role };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (status === 'blocked') query.isBlocked = true;
    if (status === 'active') query.isBlocked = false;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        users,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user details with wallet
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const wallet = await Wallet.findOne({ userId: user._id });
    const recentTransactions = await Transaction.find({ wallet: wallet?._id })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, data: { user, wallet, recentTransactions } });
  } catch (error) {
    next(error);
  }
};

// @desc    Block a user
// @route   PUT /api/admin/users/:id/block
// @access  Admin
const blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'user') return res.status(400).json({ success: false, message: 'Cannot block admin accounts' });

    user.isBlocked = true;
    // Invalidate all sessions
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save({ validateBeforeSave: false });

    await createNotification({
      userId: user._id,
      title: 'Account Blocked',
      message: 'Your account has been blocked. Please contact support for assistance.',
      type: 'ACCOUNT_BLOCKED',
    });

    await createAuditLog({
      userId: user._id,
      adminId: req.user._id,
      action: 'USER_BLOCK',
      description: `Admin blocked user: ${user.email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock a user
// @route   PUT /api/admin/users/:id/unblock
// @access  Admin
const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlocked = false;
    await user.save({ validateBeforeSave: false });

    await createAuditLog({
      userId: user._id,
      adminId: req.user._id,
      action: 'USER_UNBLOCK',
      description: `Admin unblocked user: ${user.email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Freeze wallet
// @route   PUT /api/admin/wallets/:id/freeze
// @access  Admin
const freezeWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findById(req.params.id).populate('userId', 'name email');
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });

    wallet.status = 'frozen';
    await wallet.save();

    await createNotification({
      userId: wallet.userId._id,
      title: 'Wallet Frozen',
      message: 'Your wallet has been frozen by admin. Transactions are temporarily suspended.',
      type: 'GENERAL',
    });

    await createAuditLog({
      userId: wallet.userId._id,
      adminId: req.user._id,
      action: 'WALLET_FREEZE',
      description: `Admin froze wallet: ${wallet.walletId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Wallet frozen successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfreeze wallet
// @route   PUT /api/admin/wallets/:id/unfreeze
// @access  Admin
const unfreezeWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findById(req.params.id).populate('userId', 'name email');
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });

    wallet.status = 'active';
    await wallet.save();

    await createNotification({
      userId: wallet.userId._id,
      title: 'Wallet Unfrozen',
      message: 'Your wallet has been unfrozen. You can now transact normally.',
      type: 'GENERAL',
    });

    await createAuditLog({
      userId: wallet.userId._id,
      adminId: req.user._id,
      action: 'WALLET_UNFREEZE',
      description: `Admin unfroze wallet: ${wallet.walletId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Wallet unfrozen successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions (admin)
// @route   GET /api/admin/transactions
// @access  Admin
const getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status, search, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) { const e = new Date(endDate); e.setHours(23,59,59,999); query.createdAt.$lte = e; }
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        transactions,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Admin
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action, userId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email')
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        logs,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create admin (superadmin only)
// @route   POST /api/admin/create-admin
// @access  Super Admin
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email or phone already in use' });
    }

    const admin = await User.create({ name, email, phone, password, role: 'admin', isVerified: true });
    const walletId = generateWalletId();
    await Wallet.create({ userId: admin._id, walletId, balance: 0, currency: 'INR', status: 'active' });

    await createAuditLog({
      adminId: req.user._id,
      action: 'ADMIN_CREATED',
      description: `Super admin created admin account: ${email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, message: 'Admin created successfully', data: admin });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getUserDetails,
  blockUser,
  unblockUser,
  freezeWallet,
  unfreezeWallet,
  getAllTransactions,
  getAuditLogs,
  createAdmin,
};
