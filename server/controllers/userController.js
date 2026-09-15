const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { createAuditLog } = require('../utils/auditHelper');

// @desc    Search users by email, phone, or walletId
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Please provide at least 3 characters to search' });
    }

    // Search by email or phone
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        { isBlocked: false },
        { role: 'user' },
        {
          $or: [
            { email: { $regex: q, $options: 'i' } },
            { phone: { $regex: q, $options: 'i' } },
            { name: { $regex: q, $options: 'i' } },
          ],
        },
      ],
    }).select('name email phone').limit(10);

    // Also search by walletId
    const wallets = await require('../models/Wallet').find({
      walletId: { $regex: q, $options: 'i' },
    }).populate('userId', 'name email phone isBlocked role');

    const walletUsers = wallets
      .filter((w) => w.userId && !w.userId.isBlocked && w.userId.role === 'user' && w.userId._id.toString() !== req.user._id.toString())
      .map((w) => ({
        _id: w.userId._id,
        name: w.userId.name,
        email: w.userId.email,
        phone: w.userId.phone,
        walletId: w.walletId,
      }));

    // Merge and deduplicate
    const userMap = new Map();
    users.forEach((u) => userMap.set(u._id.toString(), u));
    walletUsers.forEach((u) => {
      if (!userMap.has(u._id.toString())) userMap.set(u._id.toString(), u);
    });

    const results = Array.from(userMap.values()).slice(0, 10);

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const wallet = await Wallet.findOne({ userId: req.user._id });
    res.json({ success: true, data: { user, wallet } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (phone) {
      if (!/^[6-9]\d{9}$/.test(phone)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number' });
      }
      const existing = await User.findOne({ phone, _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Phone number already in use' });
      }
      updates.phone = phone;
    }

    if (req.file) {
      updates.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

    await createAuditLog({
      userId: req.user._id,
      action: 'PROFILE_UPDATE',
      description: 'Profile updated',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { searchUsers, getProfile, updateProfile };
