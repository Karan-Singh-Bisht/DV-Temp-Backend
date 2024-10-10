const UserBlockPages = require("../../models/Pages Model/userBlockedPagesModel");

const updateUserBlockEntry = async (req, res) => {
  const { userId, pageId } = req.params;

  try {
    // Find the block entry for the user
    let blockEntry = await UserBlockPages.findOne({ userId });

    if (blockEntry) {
      // Check if the page is already blocked
      if (!blockEntry.blockedList.includes(pageId)) {
        // If not blocked, add the pageId to the blockedList
        blockEntry.blockedList.push(pageId);
      } else {
        return res.status(200).json({ success: true, message: "Page is already blocked." });
      }
    } else {
      // If no entry exists, create a new one
      blockEntry = new UserBlockPages({
        userId,
        blockedList: [pageId],
      });
    }

    // Save the updated or newly created entry
    const savedEntry = await blockEntry.save();

    if (savedEntry) {
      return res.status(200).json({ success: true, message: "Page blocked successfully." });
    } else {
      return res.status(500).json({ success: false, message: "Failed to block page." });
    }
  } catch (error) {
    console.error('Error updating block entry:', error);
    return res.status(500).json({ success: false, message: "An error occurred while blocking the page." });
  }
};

module.exports = { updateUserBlockEntry };
