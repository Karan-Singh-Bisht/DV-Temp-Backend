const express = require('express');
const userChatController = require('../controllers/userChatController');
const userMessageController = require('../controllers/userMessageController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

const router = express.Router();


router.get('/', userAuthMiddleware, userChatController.getChats);

router.get('/messages/:chatId', userAuthMiddleware, userMessageController.getMessages);

router.post('/messages/:chatId', userAuthMiddleware, userMessageController.sendMessage);

router.patch('/messages/read/:chatId', userAuthMiddleware, userMessageController.markMessagesAsRead);

router.delete('/messages/:chatId/:messageId', userAuthMiddleware, userMessageController.deleteMessage);

router.get('/messages/:chatId/search', userAuthMiddleware, userMessageController.searchMessages);

router.get('/typing/:chatId', userAuthMiddleware, userMessageController.typingIndicator);

module.exports = router;