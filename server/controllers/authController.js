const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { generateToken } = require('../middleware/authMiddleware');
const { createAuditLog } = require('../utils/auditHelper');
const { createNotification } = require('../utils/notificationHelper');
const generateWalletId = require('../utils/generateWalletId');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      return res.status(409).json({ success: false, message: 'Phone number already registered' });
    }

    // Create user
    const user = await User.create({ name, email, phone, password, isVerified: true });

    // Create wallet automatically
    const walletId = generateWalletId();
    await Wallet.create({ userId: user._id, walletId, balance: 0, currency: 'INR', status: 'active' });

    // Audit log
    await createAuditLog({
      userId: user._id,
      action: 'REGISTER',
      description: `New user registered: ${email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Welcome notification
    await createNotification({
      userId: user._id,
      title: 'Welcome to PayWave! 🎉',
      message: `Hello ${name}! Your wallet has been created. You can now add money and start transacting.`,
      type: 'GENERAL',
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user with password
    const user = await User.findOne({ email }).select('+password +tokenVersion');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Please contact support.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await createAuditLog({
      userId: user._id,
      action: 'LOGIN',
      description: `User logged in: ${email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const wallet = await Wallet.findOne({ userId: req.user._id });

    res.json({
      success: true,
      data: { user, wallet },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    // Increment tokenVersion to invalidate all existing sessions
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    await createAuditLog({
      userId: user._id,
      action: 'PASSWORD_CHANGE',
      description: 'Password changed successfully',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    await createNotification({
      userId: user._id,
      title: 'Password Changed',
      message: 'Your password has been changed successfully. If this was not you, please contact support immediately.',
      type: 'PASSWORD_CHANGED',
    });

    res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout from all sessions
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+tokenVersion');
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save({ validateBeforeSave: false });

    await createAuditLog({
      userId: user._id,
      action: 'LOGOUT',
      description: 'User logged out from all sessions',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Logged out from all sessions' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, changePassword, logout };
