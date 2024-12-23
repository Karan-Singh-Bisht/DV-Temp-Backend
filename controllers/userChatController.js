
const Chat = require('../models/userChat');

exports.getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({ participants: userId }).populate('lastMessage');
    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};