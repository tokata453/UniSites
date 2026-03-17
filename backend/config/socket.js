'use strict';
const { Server } = require('socket.io');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:      process.env.CLIENT_URL || 'http://localhost:5173',
      methods:     ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join_user', (userId) => socket.join(`user_${userId}`));
    socket.on('leave_user', (userId) => socket.leave(`user_${userId}`));
    socket.on('join_thread', (threadId) => socket.join(`thread_${threadId}`));
    socket.on('leave_thread', (threadId) => socket.leave(`thread_${threadId}`));

    socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
