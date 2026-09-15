const express = require('express');
const router = express.Router();
const { getWallet, deposit, withdraw } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');
const { validateDeposit, validateWithdraw } = require('../validators/transactionValidator');
const { financialLimiter } = require('../middleware/rateLimitMiddleware');

router.get('/', protect, getWallet);
router.post('/deposit', protect, financialLimiter, validateDeposit, deposit);
router.post('/withdraw', protect, financialLimiter, validateWithdraw, withdraw);

module.exports = router;
