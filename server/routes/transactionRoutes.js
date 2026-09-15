const express = require('express');
const router = express.Router();
const { sendMoney, getTransactions, getTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { validateSendMoney } = require('../validators/transactionValidator');
const { financialLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/send', protect, financialLimiter, validateSendMoney, sendMoney);
router.get('/', protect, getTransactions);
router.get('/:id', protect, getTransaction);

module.exports = router;
