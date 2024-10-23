const express = require('express');
const router = express.Router();
const postController = require('../controllers/userPostController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

// Routes for managing posts
router.post('/createpost', userAuthMiddleware, postController.createPost);
router.get('/user/getallpost', userAuthMiddleware, postController.getPosts);
router.get('/getpostbyid/:postId', userAuthMiddleware, postController.getPostById);
router.patch('/upatepost', userAuthMiddleware, postController.updatePost);
router.delete('/deletepost/:postId', userAuthMiddleware, postController.deletePost);
router.post('/like/:id', userAuthMiddleware, postController.likePost);


router.post('/all', userAuthMiddleware, postController.getAllPosts);
router.get('/user/:userId', userAuthMiddleware, postController.getPostsByUserId);


// Save/Unsave a post
router.post('/save/:id', userAuthMiddleware, postController.saveOrUnsavePost);
router.post('/saved', userAuthMiddleware, postController.getSavedPosts);

router.patch('/toggle-pin/:id', userAuthMiddleware, postController.togglePinPost);


// Archive or unarchive post
router.patch('/archive:id', postController.archivePost);
router.get('/archived', postController.getArchivedPosts);
router.get('/archived/:id', postController.getArchivedPostById);


module.exports = router;
