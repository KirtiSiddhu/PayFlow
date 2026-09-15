const { v4: uuidv4 } = require('uuid');

/**
 * Generates a unique wallet ID in format: WLT-XXXXXXXXXX
 * e.g., WLT-A1B2C3D4E5
 */
const generateWalletId = () => {
  const unique = uuidv4().replace(/-/g, '').toUpperCase().slice(0, 10);
  return `WLT-${unique}`;
};

module.exports = generateWalletId;
