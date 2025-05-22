const express = require('express');
const userChatController = require('../controllers/userChatController');
const userMessageController = require('../controllers/userMessageController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

const router = express.Router();

router.get('/', userAuthMiddleware, userChatController.getChats);
router.get('/messages/:recipientId', userAuthMiddleware, userMessageController.getMessages);
router.post('/messages/:recipientId', userAuthMiddleware, userMessageController.sendMessage);
router.patch('/messages/read/:recipientId', userAuthMiddleware, userMessageController.markMessagesAsRead);
router.delete('/messages/:messageId', userAuthMiddleware, userMessageController.deleteMessage);
router.get('/messages/:recipientId/search', userAuthMiddleware, userMessageController.searchMessages);
router.get('/typing/:recipientId', userAuthMiddleware, userMessageController.typingIndicator);

module.exports = router;