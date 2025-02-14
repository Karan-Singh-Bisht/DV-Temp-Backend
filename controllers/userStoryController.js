const UserStory = require("../models/userStory");

const addStory = async (req, res) => {
  try {
    const userId = req.user._id;

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
    });

    await newStory.save();
    
    return res.status(201).json({ message: "Story added successfully", story: newStory });
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

    const story = await UserStory.findById(storyId).populate("viewedBy", "name email profileImg"); // Fetching user details

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
    return res.status(500).json({ success: false, message: "Failed to fetch stories" });
  }
};

module.exports = { addStory, deleteStory, markStoryAsRead,getStoryViewers,getAllStories };