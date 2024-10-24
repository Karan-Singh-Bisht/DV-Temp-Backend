const postController = require("../controllers/Pages/postController");
const PostActionController= require('../controllers/Pages/PostActionController')
const express = require("express");
const router = express.Router();
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');


const multer = require("../middlewares/multer");

router.post("/page/createpost", multer,userAuthMiddleware, postController.createPost);
router.get("/page/getposts/:pageId",userAuthMiddleware, postController.getPosts);
router.get("/page/getpostbyid/:postId",userAuthMiddleware, postController.getPostById);
router.get("/page/getallpost", userAuthMiddleware,postController.getAllPosts);
router.patch("/page/updatepost", multer,userAuthMiddleware, postController.updatePost);
router.delete("/page/deletepost/:postId",userAuthMiddleware, postController.deletePost);



//savePost

router.get('/page/savepost/:pageId/:saveId',userAuthMiddleware,PostActionController.savePost)
router.get('/page/allsavedpost/:pageId',userAuthMiddleware,PostActionController.allSavedPost)
router.patch('/page/archivepost/:postId',userAuthMiddleware,PostActionController.archivePost)
router.get('/page/allarchivedpost/:pageId',userAuthMiddleware,PostActionController.allArchivedPost)
router.get('/page/pinpost/:postId',userAuthMiddleware,PostActionController.setToPin)

module.exports = router;
