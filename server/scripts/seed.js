require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const MoneyRequest = require('../models/MoneyRequest');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const generateWalletId = require('../utils/generateWalletId');
const generateTransactionId = require('../utils/generateTransactionId');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');
};

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Wallet.deleteMany({}),
    Transaction.deleteMany({}),
    MoneyRequest.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Create Super Admin
  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'superadmin@paywave.com',
    phone: '9000000001',
    password: 'SuperAdmin@123',
    role: 'superadmin',
    isVerified: true,
  });
  await Wallet.create({ userId: superAdmin._id, walletId: generateWalletId(), balance: 0, currency: 'INR', status: 'active' });

  // Create Admins
  const admin1 = await User.create({
    name: 'Admin One',
    email: 'admin1@paywave.com',
    phone: '9000000002',
    password: 'Admin@1234',
    role: 'admin',
    isVerified: true,
  });
  await Wallet.create({ userId: admin1._id, walletId: generateWalletId(), balance: 0, currency: 'INR', status: 'active' });

  const admin2 = await User.create({
    name: 'Admin Two',
    email: 'admin2@paywave.com',
    phone: '9000000003',
    password: 'Admin@1234',
    role: 'admin',
    isVerified: true,
  });
  await Wallet.create({ userId: admin2._id, walletId: generateWalletId(), balance: 0, currency: 'INR', status: 'active' });

  // Create 10 users
  const userSeedData = [
    { name: 'Arjun Sharma', email: 'arjun@example.com', phone: '9876543210', balance: 25450 },
    { name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', balance: 12800 },
    { name: 'Rohan Mehta', email: 'rohan@example.com', phone: '9876543212', balance: 8500 },
    { name: 'Sneha Iyer', email: 'sneha@example.com', phone: '9876543213', balance: 45000 },
    { name: 'Karan Singh', email: 'karan@example.com', phone: '9876543214', balance: 3200 },
    { name: 'Pooja Gupta', email: 'pooja@example.com', phone: '9876543215', balance: 67800 },
    { name: 'Vikram Nair', email: 'vikram@example.com', phone: '9876543216', balance: 15600 },
    { name: 'Ananya Reddy', email: 'ananya@example.com', phone: '9876543217', balance: 29900 },
    { name: 'Rahul Verma', email: 'rahul@example.com', phone: '9876543218', balance: 0 },
    { name: 'Meera Joshi', email: 'meera@example.com', phone: '9876543219', balance: 54300 },
  ];

  const createdUsers = [];
  const createdWallets = [];

  for (const userData of userSeedData) {
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: 'User@1234',
      role: 'user',
      isVerified: true,
    });

    const wallet = await Wallet.create({
      userId: user._id,
      walletId: generateWalletId(),
      balance: userData.balance,
      currency: 'INR',
      status: 'active',
      totalReceived: userData.balance,
    });

    createdUsers.push(user);
    createdWallets.push(wallet);
  }

  // Create sample transactions
  const txnTypes = ['DEPOSIT', 'TRANSFER', 'RECEIVED', 'WITHDRAWAL'];
  const txnStatuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'FAILED', 'PENDING'];

  for (let i = 0; i < 30; i++) {
    const userIdx = Math.floor(Math.random() * createdUsers.length);
    const recipIdx = Math.floor(Math.random() * createdUsers.length);
    const type = txnTypes[Math.floor(Math.random() * txnTypes.length)];
    const status = txnStatuses[Math.floor(Math.random() * txnStatuses.length)];
    const amount = Math.floor(Math.random() * 5000) + 100;

    const daysAgo = Math.floor(Math.random() * 60);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    await Transaction.create({
      transactionId: generateTransactionId(),
      sender: type === 'RECEIVED' || type === 'DEPOSIT' ? null : createdUsers[userIdx]._id,
      receiver: type === 'TRANSFER' || type === 'WITHDRAWAL' ? null : createdUsers[recipIdx]._id,
      wallet: createdWallets[userIdx]._id,
      type,
      amount,
      status,
      description: `Sample ${type.toLowerCase()} transaction`,
      createdAt,
      updatedAt: createdAt,
    });
  }

  // Create sample money requests
  await MoneyRequest.create({
    requester: createdUsers[0]._id,
    recipient: createdUsers[1]._id,
    amount: 500,
    note: 'Split for dinner',
    status: 'PENDING',
  });

  await MoneyRequest.create({
    requester: createdUsers[2]._id,
    recipient: createdUsers[3]._id,
    amount: 1200,
    note: 'Movie tickets',
    status: 'ACCEPTED',
  });

  // Create sample notifications
  for (const user of createdUsers.slice(0, 5)) {
    await Notification.create({
      userId: user._id,
      title: 'Welcome to PayWave! 🎉',
      message: 'Your wallet is ready. Start adding money and transacting securely.',
      type: 'GENERAL',
    });
    await Notification.create({
      userId: user._id,
      title: 'Security Tip',
      message: 'Never share your OTP or PIN with anyone, including PayWave support.',
      type: 'GENERAL',
      isRead: true,
    });
  }

  // Create sample audit logs
  await AuditLog.create({
    userId: createdUsers[0]._id,
    action: 'LOGIN',
    description: `Seed: user ${createdUsers[0].email} logged in`,
    ipAddress: '127.0.0.1',
    userAgent: 'Seed Script',
  });

  console.log('\n✅ Seed complete! Demo credentials:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 Super Admin:');
  console.log('   Email:    superadmin@paywave.com');
  console.log('   Password: SuperAdmin@123\n');
  console.log('🔧 Admin 1:');
  console.log('   Email:    admin1@paywave.com');
  console.log('   Password: Admin@1234\n');
  console.log('🔧 Admin 2:');
  console.log('   Email:    admin2@paywave.com');
  console.log('   Password: Admin@1234\n');
  console.log('👤 User (all 10 users have password: User@1234)');
  console.log('   Email:    arjun@example.com   Balance: ₹25,450');
  console.log('   Email:    priya@example.com   Balance: ₹12,800');
  console.log('   Email:    sneha@example.com   Balance: ₹45,000');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
