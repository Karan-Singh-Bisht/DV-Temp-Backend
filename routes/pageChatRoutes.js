const express = require('express');
const router = express.Router();
const pageChatController = require('../controllers/Pages/pageChatController');
const pageMessageController = require('../controllers/Pages/pageMessageController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

// All routes now use senderPageId as a param
router.get('/:senderPageId', userAuthMiddleware, pageChatController.getChats);
router.get('/:senderPageId/messages/:recipientPageId', userAuthMiddleware, pageMessageController.getMessages);
router.post('/:senderPageId/messages/:recipientPageId', userAuthMiddleware, pageMessageController.sendMessage);
router.patch('/:senderPageId/messages/read/:recipientPageId', userAuthMiddleware, pageMessageController.markMessagesAsRead);
router.delete('/:senderPageId/messages/:messageId', userAuthMiddleware, pageMessageController.deleteMessage);
router.get('/:senderPageId/messages/:recipientPageId/search', userAuthMiddleware, pageMessageController.searchMessages);
router.get('/:senderPageId/typing/:recipientPageId', userAuthMiddleware, pageMessageController.typingIndicator);

module.exports = router;
