const socketIO = require('socket.io');

let io;

const setupSocket1 = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinChat', (recipientId) => {
      socket.join(recipientId);
      console.log(`User joined chat with: ${recipientId}`);
    });

    socket.on('typing', ({ recipientId, isTyping }) => {
      socket.to(recipientId).emit('typing', { recipientId, isTyping });
    });

    socket.on('newMessage', (message) => {
      const { recipientId } = message;
      io.to(recipientId).emit('newMessage', message);
    });

    socket.on('deleteMessage', ({ recipientId, messageId }) => {
      io.to(recipientId).emit('deleteMessage', { recipientId, messageId });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { setupSocket1, getIO };