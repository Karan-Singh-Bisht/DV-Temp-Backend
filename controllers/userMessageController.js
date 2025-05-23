const Message = require('../models/userMessage');
const Chat = require('../models/userChat');
const User = require('../models/User');


exports.getMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipientId },
        { sender: recipientId, recipientId: req.user.id },
      ],
    }).sort('timestamp');
    res.status(200).json({ recipientId, messages });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// exports.sendMessage = async (req, res) => {
//   try {
//     const { recipientId } = req.params;
//     const { content } = req.body;
//     const message = new Message({ recipientId, sender: req.user.id, content });
//     await message.save();
//     res.status(201).json(message);
//   } catch (err) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


exports.sendMessage = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    
    const message = new Message({ recipientId, sender: senderId, content });
    await message.save();

    
    let chat = await Chat.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!chat) {
     
      chat = new Chat({
        participants: [senderId, recipientId],
        lastMessage: message._id,
      });
    } else {
     
      chat.lastMessage = message._id;
    }

    await chat.save(); 

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};



exports.markMessagesAsRead = async (req, res) => {
  try {
    const { recipientId } = req.params;
    await Message.updateMany(
      { recipientId, sender: recipientId, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteFor } = req.body;

    if (deleteFor === 'everyone') {
      await Message.findByIdAndDelete(messageId);
    } else {
      await Message.findByIdAndUpdate(messageId, { deletedFor: req.user.id });
    }

    res.status(200).json({ success: true, messageId, deleteFor });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.searchMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const { search } = req.query;
    const messages = await Message.find({
      recipientId,
      content: { $regex: search, $options: 'i' },
    });
    res.status(200).json({ recipientId, results: messages });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.typingIndicator = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const { isTyping } = req.body;
    res.status(200).json({ success: true, isTyping, timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};