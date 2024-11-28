const { Server } = require('socket.io');

let io;
const userSockets = new Map();

const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust this as per your client origin
      methods: ['GET', 'POST'],
    },
  });

  // Store user ID and socket ID mapping

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle user identification (e.g., join a room or save their ID)
    socket.on('registerUser', (userId) => {
      console.log(`User registered: ${userId}`);
      userSockets.set(userId, socket.id); // Map userId to socket ID
    });

    // Listen for events from clients
    socket.on('sendNotification', (data) => {
      const { userId, message } = data;
      console.log(`Notification for user ${userId}: ${message}`);

      // Send notification to a specific user
      const recipientSocketId = userSockets.get(userId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receiveNotification', { message });
      } else {
        console.log(`User ${recipientId} is not connected`);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      // Remove the disconnected socket from the userSockets map
      for (const [userId, id] of userSockets.entries()) {
        if (id === socket.id) {
          userSockets.delete(userId);
          console.log(`Removed user ${userId} from active connections`);
          break;
        }
      }
    });
  });
};

// Emit notifications from other parts of the app
const sendNotification = (userId, data) => {
  if (io) {
    const recipientSocketId = userSockets.get(userId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receiveNotification', data);
    } else {
      console.log(`User ${userId} is not connected`);
    }
  }
};

module.exports = { setupSocket, sendNotification };
