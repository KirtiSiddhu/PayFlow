const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

const validateSendMoney = [
  body('recipientId')
    .notEmpty().withMessage('Recipient is required'),

  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1 }).withMessage('Amount must be at least ₹1')
    .custom((value) => {
      if (Number(value) > 100000) throw new Error('Maximum transfer limit is ₹1,00,000');
      return true;
    }),

  body('note')
    .optional()
    .isLength({ max: 200 }).withMessage('Note cannot exceed 200 characters')
    .trim(),

  handleValidation,
];

const validateDeposit = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 10 }).withMessage('Minimum deposit is ₹10')
    .custom((value) => {
      if (Number(value) > 100000) throw new Error('Maximum deposit limit is ₹1,00,000');
      return true;
    }),

  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['DEMO_CARD', 'DEMO_UPI', 'DEMO_BANK']).withMessage('Invalid payment method'),

  handleValidation,
];

const validateWithdraw = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 10 }).withMessage('Minimum withdrawal is ₹10')
    .custom((value) => {
      if (Number(value) > 50000) throw new Error('Maximum withdrawal limit is ₹50,000');
      return true;
    }),

  body('bankAccount')
    .notEmpty().withMessage('Bank account details are required')
    .isLength({ min: 3, max: 100 }).withMessage('Bank account details must be 3-100 characters'),

  handleValidation,
];

module.exports = { validateSendMoney, validateDeposit, validateWithdraw };
