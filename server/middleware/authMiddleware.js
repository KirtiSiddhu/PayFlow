const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+tokenVersion');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Check token version for logout-all-sessions
    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired, please log in again' });
    }
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = { protect, generateToken };
