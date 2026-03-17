'use strict';
const { Server } = require('socket.io');

let io;
const onlineUsers = new Map();
const socketUsers = new Map();

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

    socket.on('join_user', (userId) => {
      if (!userId) return;
      const key = String(userId);
      socket.join(`user_${key}`);
      socketUsers.set(socket.id, key);
      const nextCount = (onlineUsers.get(key) || 0) + 1;
      onlineUsers.set(key, nextCount);
      socket.emit('presence:snapshot', { userIds: Array.from(onlineUsers.keys()) });
      io.emit('presence:update', { userId: key, isOnline: true });
    });
    socket.on('leave_user', (userId) => {
      if (!userId) return;
      const key = String(userId);
      socket.leave(`user_${key}`);
      const nextCount = Math.max(0, (onlineUsers.get(key) || 0) - 1);
      if (nextCount === 0) {
        onlineUsers.delete(key);
        io.emit('presence:update', { userId: key, isOnline: false });
      } else {
        onlineUsers.set(key, nextCount);
      }
      socketUsers.delete(socket.id);
    });
    socket.on('join_thread', (threadId) => socket.join(`thread_${threadId}`));
    socket.on('leave_thread', (threadId) => socket.leave(`thread_${threadId}`));
    socket.on('typing:start', ({ conversationId, userId }) => {
      if (!conversationId || !userId) return;
      socket.to(`thread_${conversationId}`).emit('typing:update', {
        conversationId,
        userId: String(userId),
        isTyping: true,
      });
    });
    socket.on('typing:stop', ({ conversationId, userId }) => {
      if (!conversationId || !userId) return;
      socket.to(`thread_${conversationId}`).emit('typing:update', {
        conversationId,
        userId: String(userId),
        isTyping: false,
      });
    });

    socket.on('disconnect', () => {
      const userId = socketUsers.get(socket.id);
      if (userId) {
        const nextCount = Math.max(0, (onlineUsers.get(userId) || 0) - 1);
        if (nextCount === 0) {
          onlineUsers.delete(userId);
          io.emit('presence:update', { userId, isOnline: false });
        } else {
          onlineUsers.set(userId, nextCount);
        }
        socketUsers.delete(socket.id);
      }
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
