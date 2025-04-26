// === setupSocketPage.js ===
const socketIO = require('socket.io'); 
let io;

const setupSocketPage = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Page connected: ${socket.id}`);

    socket.on('joinPage', (pageId) => {
      socket.join(pageId);
      console.log(`Page joined room: ${pageId}`);
    });

    socket.on('pageTyping', ({ recipientPageId, senderPageId, isTyping }) => {
      socket.to(recipientPageId).emit('pageTyping', {
        recipientPageId,
        senderPageId,
        isTyping,
      });
    });

    socket.on('newPageMessage', (message) => {
      const { recipientPageId, senderPageId } = message;
      io.to(recipientPageId).emit('newPageMessage', message);
    });

    socket.on('deletePageMessage', ({ recipientPageId, messageId }) => {
      io.to(recipientPageId).emit('deletePageMessage', {
        recipientPageId,
        messageId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`Page disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { setupSocketPage, getIO };
