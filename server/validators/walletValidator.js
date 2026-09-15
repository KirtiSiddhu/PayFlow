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

const validateMoneyRequest = [
  body('recipientId')
    .notEmpty().withMessage('Recipient is required'),

  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1 }).withMessage('Amount must be at least ₹1')
    .custom((value) => {
      if (Number(value) > 100000) throw new Error('Request amount cannot exceed ₹1,00,000');
      return true;
    }),

  body('note')
    .optional()
    .isLength({ max: 200 }).withMessage('Note cannot exceed 200 characters')
    .trim(),

  handleValidation,
];

module.exports = { validateMoneyRequest };
