const express = require('express');
const router = express.Router();
const pageChatController = require('../controllers/Pages/pageChatController');
const pageMessageController = require('../controllers/Pages/pageMessageController');
const pageAuthMiddleware = require('../middlewares/userAuthMiddleware');

router.get('/', pageAuthMiddleware, pageChatController.getChats);
router.get('/messages/:recipientId', pageAuthMiddleware, pageMessageController.getMessages);
router.post('/messages/:recipientId', pageAuthMiddleware, pageMessageController.sendMessage);
router.patch('/messages/read/:recipientId', pageAuthMiddleware, pageMessageController.markMessagesAsRead);
router.delete('/messages/:messageId', pageAuthMiddleware, pageMessageController.deleteMessage);
router.get('/messages/:recipientId/search', pageAuthMiddleware, pageMessageController.searchMessages);
router.get('/typing/:recipientId', pageAuthMiddleware, pageMessageController.typingIndicator);

module.exports = router;
