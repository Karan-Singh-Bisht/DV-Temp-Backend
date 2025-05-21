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
// router.post('/login',authMiddleware, login);

// Vision feed routes
router.post("/feed", createPost);
router.put("/feed/:id", updatePost);
router.delete("/feed/:id", deletePost);
router.get("/feeds", getAllFeeds);
router.get("/feed/:id", getFeedById);
router.post("/avatar/upload-avataruser", uploadAvatarMulter, uploadUserAvatar);
router.post("/avatar/upload-avatarpage", uploadAvatarMulter, uploadPageAvatar);

//All the routes below this should be protected

router.get("/get-all-users", getAllUsers);
router.get("/get-user-details/:id", getUserDetails);
router.delete("/delete-user/:id", deleteUser);
router.get("/get-all-pages", getAllPages);
router.get("/get-page-details/:id", getPageDetails);
router.delete("/delete-page/:id", deletePage);

//Page Post routes
router.get("/get-all-page-posts", getAllPagePosts);
router.get("/get-page-post/:id", getPagePost);

//InfoCards routes
router.get("/get-all-infoCards", getInfoCards);
router.get("/get-info-card/:id", getInfoCard);

module.exports = router;
