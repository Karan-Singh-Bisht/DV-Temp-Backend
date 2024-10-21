const express = require('express');
const router = express.Router();
const postController = require('../controllers/userPostController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

// Routes for managing posts
router.post('/create-post', userAuthMiddleware, postController.createPost);
router.get('/user', userAuthMiddleware, postController.getPosts);
router.get('/:id', userAuthMiddleware, postController.getPostById);
router.put('/:id', userAuthMiddleware, postController.updatePost);
router.delete('/:id', userAuthMiddleware, postController.deletePost);
router.post('/like/:id', userAuthMiddleware, postController.likePost);


router.post('/all', userAuthMiddleware, postController.getAllPosts);
router.get('/user/:userId', userAuthMiddleware, postController.getPostsByUserId);



// Save/Unsave a post
router.post('/save/:id', userAuthMiddleware, postController.saveOrUnsavePost);
router.post('/saved', userAuthMiddleware, postController.getSavedPosts);

router.patch('/toggle-pin/:id', userAuthMiddleware, postController.togglePinPost);


module.exports = router;
