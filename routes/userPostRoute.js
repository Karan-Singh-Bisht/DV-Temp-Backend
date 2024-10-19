const express = require('express');
const router = express.Router();
const postController = require('../controllers/userPostController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

// Routes for managing posts
router.post('/create-post', userAuthMiddleware, postController.createPost);
router.get('/', userAuthMiddleware, postController.getPosts);
router.get('/:id', userAuthMiddleware, postController.getPostById);
router.put('/:id', userAuthMiddleware, postController.updatePost);
router.delete('/:id', userAuthMiddleware, postController.deletePost);
router.post('/like/:id', userAuthMiddleware, postController.likePost);

module.exports = router;
