const { Server } = require('socket.io');

let io;
const userSockets = new Map(); // Map user ID to their socket ID(s)

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('setup', (userId) => {
        if (!userId) return;
        socket.join(userId);
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} joined their personal room`);
        socket.emit('connected');
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Remove from map if needed, though they will automatically leave rooms
        for (const [userId, socketId] of userSockets.entries()) {
          if (socketId === socket.id) {
            userSockets.delete(userId);
            break;
          }
        }
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },

  emitToUser: (userId, eventName, data) => {
    if (!io) return;
    io.to(userId.toString()).emit(eventName, data);
  }
};
