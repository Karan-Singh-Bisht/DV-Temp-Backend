const express = require("express");
const {
  login,
  createPost,
  updatePost,
  deletePost,
  getAllFeeds,
  getFeedById,
  uploadUserAvatar,
  uploadPageAvatar,
  getAllUsers,
  getUserDetails,
  getAllPages,
  getPageDetails,
  deleteUser,
  deletePage,
  getAllPagePosts,
  getPagePost,
  getInfoCards,
  getInfoCard,
} = require("../controllers/adminController/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadAvatarMulter } = require("../middlewares/multer");

const router = express.Router();

router.post("/login", login);

// Vision feed routes
router.post("/feed", authMiddleware, createPost);
router.put("/feed/:id", authMiddleware, updatePost);
router.delete("/feed/:id", authMiddleware, deletePost);
router.get("/feeds", authMiddleware, getAllFeeds);
router.get("/feed/:id", authMiddleware, getFeedById);
router.post("/avatar/upload-avataruser", uploadAvatarMulter, uploadUserAvatar);
router.post("/avatar/upload-avatarpage", uploadAvatarMulter, uploadPageAvatar);

router.get("/get-all-users", authMiddleware, getAllUsers);
router.get("/get-user-details/:id", authMiddleware, getUserDetails);
router.delete("/delete-user/:id", authMiddleware, deleteUser);
router.get("/get-all-pages", authMiddleware, getAllPages);
router.get("/get-page-details/:id", authMiddleware, getPageDetails);
router.delete("/delete-page/:id", authMiddleware, deletePage);

//Page Post routes
router.get("/get-all-page-posts", authMiddleware, getAllPagePosts);
router.get("/get-page-post/:id", authMiddleware, getPagePost);

//InfoCards routes
router.get("/get-all-infoCards", authMiddleware, getInfoCards);
router.get("/get-info-card/:id", authMiddleware, getInfoCard);

module.exports = router;
