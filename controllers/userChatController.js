const Chat = require('../models/userChat');
const User = require('../models/User');

// Fetch user chats with profileImg and username
exports.getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({ participants: userId })
      .populate({
        path: 'participants',
        select: 'username profileImg', // Fetch only required fields
      })
      .populate({
        path: 'lastMessage',
        select: 'content sender recipientId createdAt',
      });

    res.status(200).json({
      success: true,
      message: "Chats retrieved successfully",
      data: chats.map(chat => {
        const otherParticipant = chat.participants.find(p => p._id.toString() !== userId);
        return {
          _id: chat._id,
          lastMessage: chat.lastMessage,
          participant: otherParticipant, // Send other participant's details
        };
      }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
