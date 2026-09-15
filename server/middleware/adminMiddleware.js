// Only admin or superadmin
const adminOnly = (req, res, next) => {
  if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next();
};

// Only superadmin
const superAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Access denied. Super Admin only.' });
  }
  next();
};

module.exports = { adminOnly, superAdminOnly };
