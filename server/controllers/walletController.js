const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { createNotification } = require('../utils/notificationHelper');
const { createAuditLog } = require('../utils/auditHelper');
const generateTransactionId = require('../utils/generateTransactionId');

// @desc    Get wallet details
// @route   GET /api/wallet
// @access  Private
const getWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }
    res.json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
};

// @desc    Deposit money (simulated payment)
// @route   POST /api/wallet/deposit
// @access  Private
const deposit = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, paymentMethod } = req.body;
    const depositAmount = parseFloat(amount);

    const wallet = await Wallet.findOne({ userId: req.user._id }).session(session);
    if (!wallet) throw new Error('Wallet not found');

    if (wallet.status !== 'active') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: `Your wallet is ${wallet.status}. Cannot deposit.` });
    }

    const transactionId = generateTransactionId();

    // Simulate payment gateway — random 95% success rate for demo
    const isSuccess = Math.random() > 0.05;

    if (!isSuccess) {
      // Create failed transaction record
      await Transaction.create([{
        transactionId,
        receiver: req.user._id,
        wallet: wallet._id,
        type: 'DEPOSIT',
        amount: depositAmount,
        status: 'FAILED',
        description: `Deposit via ${paymentMethod} (Simulated failure)`,
        metadata: { paymentMethod },
      }], { session });

      await session.commitTransaction();

      await createNotification({
        userId: req.user._id,
        title: 'Deposit Failed',
        message: `Your deposit of ₹${depositAmount.toLocaleString('en-IN')} failed. Please try again.`,
        type: 'DEPOSIT_FAILED',
      });

      return res.status(400).json({ success: false, message: 'Payment failed. Please try again.' });
    }

    // Successful deposit
    wallet.balance += depositAmount;
    wallet.totalReceived += depositAmount;
    await wallet.save({ session });

    await Transaction.create([{
      transactionId,
      receiver: req.user._id,
      wallet: wallet._id,
      type: 'DEPOSIT',
      amount: depositAmount,
      status: 'COMPLETED',
      description: `Deposit via ${paymentMethod}`,
      metadata: { paymentMethod },
    }], { session });

    await session.commitTransaction();

    await createNotification({
      userId: req.user._id,
      title: 'Money Added Successfully! 💰',
      message: `₹${depositAmount.toLocaleString('en-IN')} has been added to your wallet via ${paymentMethod}.`,
      type: 'DEPOSIT_SUCCESS',
    });

    await createAuditLog({
      userId: req.user._id,
      action: 'DEPOSIT',
      description: `Deposited ₹${depositAmount} via ${paymentMethod}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const updatedWallet = await Wallet.findOne({ userId: req.user._id });

    res.json({
      success: true,
      message: `₹${depositAmount.toLocaleString('en-IN')} added to your wallet successfully!`,
      data: { wallet: updatedWallet, transactionId },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Withdraw money
// @route   POST /api/wallet/withdraw
// @access  Private
const withdraw = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, bankAccount } = req.body;
    const withdrawAmount = parseFloat(amount);

    const wallet = await Wallet.findOne({ userId: req.user._id }).session(session);
    if (!wallet) throw new Error('Wallet not found');

    if (wallet.status !== 'active') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: `Your wallet is ${wallet.status}. Cannot withdraw.` });
    }

    if (wallet.balance < withdrawAmount) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    const transactionId = generateTransactionId();

    wallet.balance -= withdrawAmount;
    wallet.totalWithdrawn += withdrawAmount;
    await wallet.save({ session });

    await Transaction.create([{
      transactionId,
      sender: req.user._id,
      wallet: wallet._id,
      type: 'WITHDRAWAL',
      amount: withdrawAmount,
      status: 'COMPLETED',
      description: `Withdrawal to ${bankAccount}`,
      metadata: { bankAccount },
    }], { session });

    await session.commitTransaction();

    await createNotification({
      userId: req.user._id,
      title: 'Withdrawal Successful',
      message: `₹${withdrawAmount.toLocaleString('en-IN')} has been withdrawn from your wallet.`,
      type: 'WITHDRAWAL_SUCCESS',
    });

    await createAuditLog({
      userId: req.user._id,
      action: 'WITHDRAWAL',
      description: `Withdrew ₹${withdrawAmount} to ${bankAccount}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const updatedWallet = await Wallet.findOne({ userId: req.user._id });

    res.json({
      success: true,
      message: `₹${withdrawAmount.toLocaleString('en-IN')} withdrawn successfully!`,
      data: { wallet: updatedWallet, transactionId },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports = { getWallet, deposit, withdraw };
