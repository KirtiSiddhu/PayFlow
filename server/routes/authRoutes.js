const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin, validateChangePassword } = require('../validators/authValidator');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, validateChangePassword, changePassword);

module.exports = router;
