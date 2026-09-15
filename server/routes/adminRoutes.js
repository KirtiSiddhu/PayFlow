const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, superAdminOnly } = require('../middleware/adminMiddleware');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.put('/wallets/:id/freeze', freezeWallet);
router.put('/wallets/:id/unfreeze', unfreezeWallet);
router.get('/transactions', getAllTransactions);
router.get('/audit-logs', getAuditLogs);

// Super Admin only
router.post('/create-admin', superAdminOnly, createAdmin);

module.exports = router;
