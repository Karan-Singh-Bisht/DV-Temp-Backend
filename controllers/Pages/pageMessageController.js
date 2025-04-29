const PageMessage = require('../../models/Pages/pageMessage');
const { getIO } = require('../../server/setupSocketPage');

exports.getMessages = async (req, res) => {
  const { senderPageId, recipientPageId } = req.params;

  try {
    const messages = await PageMessage.find({
      $or: [
        { senderPageId, recipientPageId },
        { senderPageId: recipientPageId, recipientPageId: senderPageId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};


exports.sendMessage = async (req, res) => {
  const { senderPageId, recipientPageId } = req.params;
  const { content } = req.body;

  try {
    const message = await PageMessage.create({
      senderPageId,
      recipientPageId,
      content,
    });

    getIO().to(recipientPageId).emit('newPageMessage', message);
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};


exports.markMessagesAsRead = async (req, res) => {
  const { senderPageId, recipientPageId } = req.params;

  try {
    await PageMessage.updateMany(
      {
        senderPageId: recipientPageId,
        recipientPageId: senderPageId,
        isRead: false,
      },
      { isRead: true }
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};


exports.deleteMessage = async (req, res) => {
  const { senderPageId, messageId } = req.params;

  try {
    const message = await PageMessage.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    if (message.senderPageId.toString() !== senderPageId) {
      return res.status(403).json({ error: 'Not authorized to delete' });
    }

    await message.deleteOne();

    getIO().to(message.recipientPageId.toString()).emit('deletePageMessage', {
      recipientPageId: message.recipientPageId.toString(),
      messageId,
    });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};


exports.searchMessages = async (req, res) => {
  const { senderPageId, recipientPageId } = req.params;
  const { q } = req.query;

  try {
    const messages = await PageMessage.find({
      $or: [
        { senderPageId, recipientPageId },
        { senderPageId: recipientPageId, recipientPageId: senderPageId },
      ],
      content: { $regex: q, $options: 'i' },
    });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
};


exports.typingIndicator = (req, res) => {
  const { senderPageId, recipientPageId } = req.params;

  getIO().to(recipientPageId).emit('pageTyping', {
    recipientPageId,
    senderPageId,
    isTyping: true,
  });

  res.status(200).json({ typing: true });
};
