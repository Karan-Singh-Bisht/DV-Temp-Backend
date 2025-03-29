const express = require("express");
const { uploadStoryMulter, uploadCollectionMulter } = require("../middlewares/multer");
const userAuthMiddleware = require("../middlewares/userAuthMiddleware");

const {
  addStory,
  deleteStory,
  markStoryAsRead,
  getStoryViewers,
  getAllStories,
  getStoryByUserId,
  createSpotlightCollection,
  addStoryToSpotlightCollection,
  removeStoryFromSpotlightCollection,
  getUserSpotlightCollections,
  deleteSpotlightCollection,
  getSpotlightCollectionById
} = require("../controllers/userStoryController");

const router = express.Router();

router.post("/users/addnewstory", userAuthMiddleware, uploadStoryMulter, addStory);
router.delete("/users/deletestory/:storyId", userAuthMiddleware, deleteStory);
router.post("/users/markstoryasread/:storyId", userAuthMiddleware, markStoryAsRead);
router.get("/users/storyviewers/:storyId", userAuthMiddleware, getStoryViewers);
router.get("/users/stories", userAuthMiddleware, getAllStories);
router.get("/users/story/:userId", userAuthMiddleware, getStoryByUserId);


// Create a new Spotlight Collection
router.post("/users/spotlight/create", userAuthMiddleware, uploadCollectionMulter, createSpotlightCollection);

// Add a story to a Spotlight Collection
router.post("/users/spotlight/:collectionId/add/:storyId", userAuthMiddleware, addStoryToSpotlightCollection);

// Remove a story from a Spotlight Collection
router.delete("/users/spotlight/:collectionId/remove/:storyId", userAuthMiddleware, removeStoryFromSpotlightCollection);

// Get all Spotlight Collections of a user
router.get("/users/spotlight", userAuthMiddleware, getUserSpotlightCollections);

// Delete a Spotlight Collection
router.delete("/users/spotlight/:collectionId", userAuthMiddleware, deleteSpotlightCollection);

// Get a specific Spotlight Collection by ID
router.get("/users/spotlight/:collectionId", userAuthMiddleware, getSpotlightCollectionById);




module.exports = router;
