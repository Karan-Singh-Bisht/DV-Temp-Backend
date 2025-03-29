const UserStory = require("../models/userStory");
const SpotlightCollection = require("../models/SpotlightCollectionSchema");

const addStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { description } = req.body;

    const media = req.files["story"][0]
      ? {
          path: req.files["story"][0].path,
          public_id: req.files["story"][0].filename,
        }
      : null;

    if (!media) {
      return res.status(400).json({ message: "Story media is required" });
    }

    const newStory = new UserStory({
      userId,
      media,
      description,
    });

    await newStory.save();

    return res
      .status(201)
      .json({ message: "Story added successfully", story: newStory });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user._id;

    const story = await UserStory.findOne({ _id: storyId, userId });

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    await UserStory.deleteOne({ _id: storyId });

    return res.status(200).json({ message: "Story deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
const markStoryAsRead = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user._id;

    const story = await UserStory.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (!story.viewedBy.includes(userId)) {
      story.viewedBy.push(userId);
      await story.save();
    }

    return res.status(200).json({ message: "Story marked as read" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getStoryViewers = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await UserStory.findById(storyId).populate(
      "viewedBy",
      "name email profileImg"
    ); // Fetching user details

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    return res.status(200).json({ viewers: story.viewedBy });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllStories = async (req, res) => {
  try {
    const stories = await UserStory.find()
      .populate("userId", "name profilePicture") // Fetch user name & profile picture
      .sort({ createdAt: -1 }); // Newest stories first

    return res.status(200).json({ success: true, stories });
  } catch (error) {
    console.error("Error fetching stories:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch stories" });
  }
};


const getStoryByUserId = async (req, res) => {
  try {
      const { userId } = req.params;

      const stories = await UserStory.find({ userId })
          .sort({ createdAt: -1 }) // Sort by newest first
          .populate('userId', 'username profileImg'); // Populate user details

      if (!stories || stories.length === 0) {
          return res.status(404).json({
              success: false,
              message: "No stories found for this user"
          });
      }

      res.status(200).json({
          success: true,
          stories
      });

  } catch (error) {
      console.error("Error fetching user's stories:", error);
      res.status(500).json({
          success: false,
          message: "Internal server error"
      });
  }
};




const createSpotlightCollection = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name } = req.body;

    const collectionImg = req.files["collectionImg"][0]
      ? {
          path: req.files["collectionImg"][0].path,
          public_id: req.files["collectionImg"][0].filename,
        }
      : null;

    if (!collectionImg) {
      return res.status(400).json({ message: "Collection image is required" });
    }

    const newCollection = new SpotlightCollection({
      userId,
      name,
      collectionImg,
      stories: [],
    });

    await newCollection.save();

    return res
      .status(201)
      .json({ message: "Spotlight Collection created successfully", collection: newCollection });
  } catch (error) {
    console.error("Error creating spotlight collection:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};


const addStoryToSpotlightCollection = async (req, res) => {
  try {
    const { collectionId, storyId } = req.params;
    const userId = req.user._id;

    const collection = await SpotlightCollection.findOne({ _id: collectionId, userId });

    if (!collection) {
      return res.status(404).json({ message: "Spotlight Collection not found" });
    }

    if (collection.stories.includes(storyId)) {
      return res.status(400).json({ message: "Story is already in this collection" });
    }

    collection.stories.push(storyId);
    await collection.save();

    return res.status(200).json({ message: "Story added to Spotlight Collection", collection });
  } catch (error) {
    console.error("Error adding story to Spotlight Collection:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};


const removeStoryFromSpotlightCollection = async (req, res) => {
  try {
    const { collectionId, storyId } = req.params;
    const userId = req.user._id;

    const collection = await SpotlightCollection.findOne({ _id: collectionId, userId });

    if (!collection) {
      return res.status(404).json({ message: "Spotlight Collection not found" });
    }

    collection.stories = collection.stories.filter((id) => id.toString() !== storyId);
    await collection.save();

    return res.status(200).json({ message: "Story removed from Spotlight Collection", collection });
  } catch (error) {
    console.error("Error removing story from Spotlight Collection:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};


const getUserSpotlightCollections = async (req, res) => {
  try {
    const userId = req.user._id;

    const collections = await SpotlightCollection.find({ userId })
      .populate("stories", "media description createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, collections });
  } catch (error) {
    console.error("Error fetching user spotlight collections:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};


const deleteSpotlightCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const userId = req.user._id;

    const collection = await SpotlightCollection.findOne({ _id: collectionId, userId });

    if (!collection) {
      return res.status(404).json({ message: "Spotlight Collection not found" });
    }

    await SpotlightCollection.deleteOne({ _id: collectionId });

    return res.status(200).json({ message: "Spotlight Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting spotlight collection:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};


const getSpotlightCollectionById = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const userId = req.user._id;

    const collection = await SpotlightCollection.findOne({ _id: collectionId, userId })
      .populate("stories", "media description createdAt");

    if (!collection) {
      return res.status(404).json({ message: "Spotlight Collection not found" });
    }

    return res.status(200).json({ success: true, collection });
  } catch (error) {
    console.error("Error fetching spotlight collection by ID:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};




module.exports = {
  createSpotlightCollection,
  addStoryToSpotlightCollection,
  removeStoryFromSpotlightCollection,
  getUserSpotlightCollections,
  deleteSpotlightCollection,
  getSpotlightCollectionById,
  addStory,
  deleteStory,
  markStoryAsRead,
  getStoryViewers,
  getAllStories,
  getStoryByUserId
};
