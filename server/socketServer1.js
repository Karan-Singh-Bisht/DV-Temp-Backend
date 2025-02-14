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

    // Join chat room
    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    // Handle typing indicator
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(chatId).emit('typing', { chatId, isTyping });
    });

    // Handle new message
    socket.on('newMessage', (message) => {
      const { chatId } = message;
      io.to(chatId).emit('newMessage', message);
    });

    // Handle message deletion
    socket.on('deleteMessage', ({ chatId, messageId }) => {
      io.to(chatId).emit('deleteMessage', { chatId, messageId });
    });

    // Handle disconnection
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
