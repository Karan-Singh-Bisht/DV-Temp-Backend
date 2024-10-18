const postController = require("../controllers/Pages/postController");
const express = require("express");
const router = express.Router();

const multer = require("../middlewares/multer");

router.post("/page/createpost", multer, postController.createPost);
router.get("/page/getposts/:pageId", postController.getPosts);
router.get("/page/getpostbyid/:id", postController.getPostById);
router.get("/page/getallpost", postController.getAllPosts);
router.patch("/page/updatepost", multer, postController.updatePost);
router.delete("/page/deletepost/:postId", postController.deletePost);

module.exports = router;
