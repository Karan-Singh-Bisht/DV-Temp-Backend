
const Message = require('../models/userMessage');

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).sort('timestamp');
    res.status(200).json({ chatId, messages });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const message = new Message({ chatId, sender: req.user.id, content });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Message.updateMany({ chatId, isRead: false }, { isRead: true });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
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
    const { chatId } = req.params;
    const { search } = req.query;
    const messages = await Message.find({
      chatId,
      content: { $regex: search, $options: 'i' },
    });
    res.status(200).json({ chatId, results: messages });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.typingIndicator = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { isTyping } = req.body;
    res.status(200).json({ success: true, isTyping, timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
