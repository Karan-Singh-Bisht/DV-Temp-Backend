const express = require('express');
const router = express.Router();
const postController = require('../controllers/userPostController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

// Routes for managing posts
router.post('/createpost', userAuthMiddleware, postController.createPost);
router.get('/user/getposts', userAuthMiddleware, postController.getPosts);
router.get('/getpostbyid/:postId', userAuthMiddleware, postController.getPostById);
router.patch('/updatepost', userAuthMiddleware, postController.updatePost);
router.delete('/deletepost/:postId', userAuthMiddleware, postController.deletePost);
router.patch('/like/:postId', userAuthMiddleware, postController.likePost);


router.get('/getallpost', userAuthMiddleware, postController.getAllPosts);
router.get('/user/getposts/:userId', userAuthMiddleware, postController.getPostsByUserId);


// Save/Unsave a post
router.get('/savepost/:saveId', userAuthMiddleware, postController.saveOrUnsavePost);
router.get('/allsavedpost', userAuthMiddleware, postController.getSavedPosts);
router.patch('/pinpost/:postId', userAuthMiddleware, postController.togglePinPost);


// Archive or unarchive post
router.patch('/archivepost/:postId',userAuthMiddleware, postController.archivePost);
router.get('/allarchivedpost',userAuthMiddleware, postController.getArchivedPosts);
router.get('/archived/:postId',userAuthMiddleware, postController.getArchivedPostById);

module.exports = router;
