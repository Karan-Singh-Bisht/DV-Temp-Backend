const postController = require("../controllers/Pages/postController");
const pageController = require("../controllers/Pages/PagesController");
const PostActionController= require('../controllers/Pages/PostActionController')
const express = require("express");
const router = express.Router();
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');


const multer = require("../middlewares/multer");

router.post("/page/createpost", multer,userAuthMiddleware, postController.createPost);
router.post("/page/createcadpost", multer,userAuthMiddleware, postController.createCadPost);
router.get("/page/getposts/:pageId",userAuthMiddleware, postController.getPosts);
router.get("/page/getpostbyid/:postId",userAuthMiddleware, postController.getPostById);
router.get("/page/getallpost", userAuthMiddleware,postController.getAllPosts);
router.patch("/page/updatepost", multer,userAuthMiddleware, postController.updatePost);
router.delete("/page/deletepost/:postId",userAuthMiddleware, postController.deletePost);

router.get("/page/getallvisiofeeds", userAuthMiddleware,postController.getCombinedPosts);



//savePost

router.get('/page/savepost/:pageId/:saveId',userAuthMiddleware,PostActionController.savePost)
router.get('/page/allsavedpost/:pageId',userAuthMiddleware,PostActionController.allSavedPost)
router.get('/page/archivepost/:postId',userAuthMiddleware,PostActionController.archivePost)
router.get('/page/allarchivedpost/:pageId',userAuthMiddleware,PostActionController.allArchivedPost)
router.get('/page/pinpost/:postId',userAuthMiddleware,PostActionController.setToPin)

router.get('/page/like/:postId/:userPageId',userAuthMiddleware,PostActionController.actionLike)




//report pagepost
router.post('/page/reportpagepost',userAuthMiddleware,pageController.reportpagePost)
//report page
router.post('/page/reportpage',userAuthMiddleware,pageController.reportpage)
module.exports = router;
