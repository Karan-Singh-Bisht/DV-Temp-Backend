const PageActions = require("../../models/Pages Model/PageActionsModel");

const updateUserBlockEntry = async (req, res) => {
  const {  pageId } = req.params;
const userId= req.user._id
  try {
    // Find the block entry for the user
    let blockEntry = await PageActions.findOne({ userId });

    if (blockEntry) {
      // Check if the page is already blocked
      if (!blockEntry.blockedList.includes(pageId)) {
        // If not blocked, add the pageId to the blockedList
        blockEntry.blockedList.push(pageId);
      } else {
        return res
          .status(200)
          .json({ success: true, message: "Page is already blocked." });
      }
    } else {
      // If no entry exists, create a new one
      blockEntry = new PageActions({
        userId,
        blockedList: [pageId],
      });
    }

    // Save the updated or newly created entry
    const savedEntry = await blockEntry.save();

    if (savedEntry) {
      return res
        .status(200)
        .json({ success: true, message: "Page blocked successfully." });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Failed to block page." });
    }
  } catch (error) {
    console.error("Error updating block entry:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while blocking the page.",
      });
  }
};

const addToFollowing = async (req, res) => {
  try {
    const pageId = req.params.pageId;

    // Check if the page is already followed
    const isFollowed = await PageActions.findOne({
      userId: req.user._id,
      followingList: { $in: [pageId] },
    });

    if (isFollowed) {
      return res
        .status(400)
        .json({ success: false, message: "This page is already followed." });
    }

    // If not followed, add it to the followingList
    const updatedPageActions = await PageActions.findOneAndUpdate(
      { userId: req.user._id },
      { $push: { followingList: pageId } },
      { new: true, upsert: true } // `upsert` creates a new record if none exists
    );

    return res
      .status(200)
      .json({
        success: true,
        message: "Page followed successfully.",
        data: updatedPageActions,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

module.exports = { updateUserBlockEntry, addToFollowing };
