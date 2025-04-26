const PageMessage = require('../../models/Pages/pageMessage');
const { getIO } = require('../../server/setupSocketPage');

// ✅ GET all messages between two pages
exports.getMessages = async (req, res) => {
  const { recipientId } = req.params;
  const senderPageId = req.page.id;

  try {
    const messages = await PageMessage.find({
      $or: [
        { senderPageId, recipientPageId: recipientId },
        { senderPageId: recipientId, recipientPageId: senderPageId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// ✅ SEND a message
exports.sendMessage = async (req, res) => {
  const senderPageId = req.page.id;
  const { recipientId } = req.params;
  const { text } = req.body;

  try {
    const message = await PageMessage.create({
      senderPageId,
      recipientPageId: recipientId,
      text,
    });

    getIO().to(recipientId).emit('newPageMessage', message);

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// ✅ MARK messages as read
exports.markMessagesAsRead = async (req, res) => {
  const { recipientId } = req.params;
  const senderPageId = req.page.id;

  try {
    await PageMessage.updateMany(
      {
        senderPageId: recipientId,
        recipientPageId: senderPageId,
        read: false,
      },
      { read: true }
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

// ✅ DELETE a message
exports.deleteMessage = async (req, res) => {
  const senderPageId = req.page.id;
  const { messageId } = req.params;

  try {
    const message = await PageMessage.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    // Optional: Confirm that sender is the owner of the message
    if (message.senderPageId.toString() !== senderPageId) {
      return res.status(403).json({ error: 'Not authorized to delete' });
    }

    await message.deleteOne();

    getIO().to(message.recipientPageId.toString()).emit('deletePageMessage', {
      recipientId: message.recipientPageId.toString(),
      messageId,
    });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// ✅ SEARCH messages
exports.searchMessages = async (req, res) => {
  const { recipientId } = req.params;
  const { q } = req.query;
  const senderPageId = req.page.id;

  try {
    const messages = await PageMessage.find({
      $or: [
        { senderPageId, recipientPageId: recipientId },
        { senderPageId: recipientId, recipientPageId: senderPageId },
      ],
      text: { $regex: q, $options: 'i' },
    });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
};

// ✅ TYPING indicator
exports.typingIndicator = (req, res) => {
  const { recipientId } = req.params;
  const senderPageId = req.page.id;

  getIO().to(recipientId).emit('pageTyping', {
    recipientId,
    senderPageId,
    isTyping: true,
  });

  res.status(200).json({ typing: true });
};
