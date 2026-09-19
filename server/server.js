require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`
🚀 PayWave Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}
📡 API: http://localhost:${PORT}/api
🏥 Health: http://localhost:${PORT}/api/health
    `);
  });

  // Initialize Socket.io
  const socketManager = require('./socket/io');
  socketManager.init(server);
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});
