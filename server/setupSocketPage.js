// === setupSocketPage.js ===
const socketIO = require('socket.io'); 
let io;

const setupSocketPage = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Page connected: ${socket.id}`);

    // Join page-specific room
    socket.on('joinPage', (pageId) => {
      socket.join(pageId);
      console.log(`Page ${pageId} joined room`);
    });

    // Typing indicator from one page to another
    socket.on('pageTyping', ({ senderPageId, recipientPageId, isTyping }) => {
      io.to(recipientPageId).emit('pageTyping', {
        senderPageId,
        recipientPageId,
        isTyping,
      });
    });

    // Message sent from senderPageId to recipientPageId
    socket.on('newPageMessage', (message) => {
      const { recipientPageId, senderPageId } = message;
      console.log(`New message from ${senderPageId} to ${recipientPageId}`);
      io.to(recipientPageId).emit('newPageMessage', message);
    });

    // Delete a message and notify recipient page
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
