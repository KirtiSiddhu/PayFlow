const express = require('express');
const router = express.Router();
const { createRequest, getRequests, acceptRequest, rejectRequest, cancelRequest } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { validateMoneyRequest } = require('../validators/walletValidator');
const { financialLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/', protect, financialLimiter, validateMoneyRequest, createRequest);
router.get('/', protect, getRequests);
router.put('/:id/accept', protect, financialLimiter, acceptRequest);
router.put('/:id/reject', protect, rejectRequest);
router.put('/:id/cancel', protect, cancelRequest);

module.exports = router;
