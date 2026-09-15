const { v4: uuidv4 } = require('uuid');

/**
 * Generates a unique transaction ID in format: TXN-YYYY-XXXXXXX
 * e.g., TXN-2026-8F72K91
 */
const generateTransactionId = () => {
  const year = new Date().getFullYear();
  const unique = uuidv4().replace(/-/g, '').toUpperCase().slice(0, 7);
  return `TXN-${year}-${unique}`;
};

module.exports = generateTransactionId;
