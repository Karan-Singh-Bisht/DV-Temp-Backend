const ILikedPosts = require("../models/iLikedPosts");
const UserPost = require("../models/userPostSchema");

//Adds the liked content to user like post array
module.exports.likeContent = async (req, res) => {
  const { userId } = req.user;
  const { postId } = req.params;
  try {
    if (!user || !postId) {
      return res
        .status(400)
        .json({ message: "Both postId and userId is required" });
    }
    const response = await ILikedPosts.findOneAndUpdate(
      { userId },
      {
        $addToSet: { likedPosts: postId },
      },
      {
        new: true,
        upsert: true,
      }
    );
    res.status(200).json({
      message: "Content liked successfully",
      data: response,
    });
  } catch (err) {
    console.error("Error liking content:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Increase the like count
module.exports.likePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.user;

  try {
    if (!postId || !userId) {
      return res
        .status(400)
        .json({ message: "Post ID and User ID are required." });
    }

    const response = await UserPost.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    );

    res.status(200).json({
      message: "Post liked successfully",
      data: response,
    });
  } catch (err) {
    console.error("Error in likePost:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
