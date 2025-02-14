const express = require("express");
const { uploadStoryMulter } = require("../middlewares/multer");
const userAuthMiddleware = require("../middlewares/userAuthMiddleware");

const {
  addStory,
  deleteStory,
  markStoryAsRead,
  getStoryViewers,
  getAllStories
} = require("../controllers/userStoryController");

const router = express.Router();

router.post("/users/addnewstory", userAuthMiddleware, uploadStoryMulter, addStory);
router.delete("/users/deletestory/:storyId", userAuthMiddleware, deleteStory);
router.post("/users/markstoryasread/:storyId", userAuthMiddleware, markStoryAsRead);
router.get("/users/storyviewers/:storyId", userAuthMiddleware, getStoryViewers);
router.get("/users/stories", userAuthMiddleware, getAllStories);

module.exports = router;
