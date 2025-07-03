const PostModel = require("../../models/Pages/postSchema");
const UserModel = require("../../models/User");
const PostSave = require("../../models/Pages/PostSaveModel");
const PageRepost = require("../../models/Pages/PageRepost");
const PageRewrite = require("../../models/Pages/PageRewrite");

const savePost = async (req, res) => {
  try {
    const { pageId, saveId } = req.params;

    const ifPost = await PostModel.findById(saveId);

    if (!ifPost) {
      return res
        .status(404)
        .json({ message: "Post not availabe", success: false });
    }

    // Check if the saveId is already in savedPosts
    const isSaved = await PostSave.findOne({
      pageId,
      savedPosts: { $in: [saveId] },
    });

    if (!isSaved) {
      // If not saved, push the saveId into savedPosts array
      const updatedData = await PostSave.findOneAndUpdate(
        { pageId },
        { $push: { savedPosts: saveId } },
        { new: true, upsert: true } // 'upsert' creates a new document if none exists
      );
      if (updatedData) {
        res
          .status(200)
          .json({ message: "Post saved successfully", success: true });
      } else {
        res.status(400).json({ message: "Post saved fail", success: false });
      }
    } else {
      const deletedData = await PostSave.findOneAndUpdate(
        { pageId },
        { $pull: { savedPosts: saveId } },
        { new: true } // 'new: true' returns the modified document
      );
      if (deletedData) {
        res
          .status(200)
          .json({ message: "Saved Post Deleted successfully", success: true });
      } else {
        res.status(404).json({ message: "Post deleted fail", success: false });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const allSavedPost = async (req, res) => {
  try {
    const pageId = req.params.pageId;

    const allData = await PostSave.findOne({ pageId })
      .populate({
        path: "savedPosts",
        populate: {
          path: "pageId",
          select: "pageName profileImg", // Only return these fields from Pages
        },
      });

    if (allData) {
      res.status(200).json({ data: allData, success: true });
    } else {
      res.status(404).json({
        success: false,
        message: "No saved posts found for this pageId",
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const allArchivedPost = async (req, res) => {
  try {
    const { pageId } = req.params; // Destructure pageId from req.params
    const allArchivedData = await PostModel.find({
      pageId,
      isArchive: true,
    }).populate("pageId", "pageName date_of_birth gender userName profileImg");
    if (allArchivedData) {
      return res
        .status(200)
        .json({
          success: true,
          data: allArchivedData,
          message: "Fetch successfully",
        }); // Send the response with archived data
    } else {
      return res
        .status(404)
        .json({ success: false, message: "fail to fetch archived data" }); // Send the response with archived data
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal  Server error" }); // Return a response in case of error
  }
};

const setToPin = async (req, res) => {
  try {
    const postId = req.params.postId; // Assuming postId is passed in the request params

    // Find the post by ID
    const post = await PostModel.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Count the number of pinned posts
    const pinnedCount = await PostModel.countDocuments({ pinned: true });

    // Toggle the pinned status
    if (post.pinned) {
      post.pinned = false;
      // Remove the pinnedAt timestamp when unpinning
    } else {
      // Ensure no more than 3 posts are pinned
      if (pinnedCount >= 3) {
        return res
          .status(400)
          .json({ success: false, error: "You can only pin up to 3 posts" });
      }
      post.pinned = true;
      post.pinnedAt = new Date(); // Set the timestamp when pinning
    }

    // Save the updated post
    await post.save();

    res.json({ success: true, message: "Success", post });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: "Internal Server error" });
  }
};

// Example of fetching posts with pinned posts at the top
const getPosts = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ pinned: -1, pinnedAt: -1 }) // Sort pinned posts at the top and by recent pinned date
      .exec();

    res.json({ success: true, posts });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: "Internal Server error" });
  }
};

const archivePost = async (req, res) => {
  const postId = req.params.postId;

  try {
    // Find the post by its ID
    const post = await PostModel.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    // Toggle the isArchive field
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { isArchive: !post.isArchive }, // Toggle the value
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: `Post ${
        updatedPost.isArchive ? "archived" : "unarchived"
      } successfully`,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating the post", error });
  }
};

const actionLike = async (req, res) => {
  const { postId, userPageId } = req.params;

  try {
    // Check if the post exists and if the user has already liked it
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already liked the post
    const isLiked = post.likes.includes(userPageId);

    if (isLiked) {
      // If the post is already liked, remove the like
      await PostModel.findByIdAndUpdate(postId, {
        $pull: { likes: userPageId },
      });
      return res.status(200).json({ message: "Like removed" });
    } else {
      // If the post is not liked, add the like
      await PostModel.findByIdAndUpdate(postId, {
        $push: { likes: userPageId },
      });
      return res.status(200).json({ message: "Post liked" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};






//From this part::::::::::::::
const createPageRepost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const { pageId } = req.body; // posting pageId from frontend

    const pagePost = await Post.findById(postId);
    if (!pagePost) {
      return res.status(404).json({ message: "Page post not found" });
    }

    const newRepost = await PageRepost.create({
      user: userId,
      pageId,
      pagePost: postId,
    });

    res.status(201).json({ message: "Page post reposted successfully", data: newRepost });
  } catch (err) {
    console.error("Error creating page repost:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getAllPageReposts = async (req, res) => {
  try {
    const reposts = await PageRepost.find()
      .populate({
        path: "pagePost",
        populate: {
          path: "pageId",
          select: "pageName profileImg",
        },
      })
      .populate({
        path: "pageId", // reposting page
        select: "pageName profileImg",
      })
      .sort({ createdAt: -1 });

    if (!reposts.length) {
      return res.status(200).json({ message: "No page reposts found" });
    }

    res.status(200).json(reposts);
  } catch (err) {
    console.error("Error fetching all page reposts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const editPageRepost = async (req, res) => {
  try {
    const { repostId } = req.params;
    const userId = req.user._id;

    const repost = await PageRepost.findOne({ _id: repostId, user: userId });
    if (!repost) {
      return res.status(404).json({ message: "Repost not found" });
    }

    // You can update specific fields here if needed in future
    // repost.updatedField = req.body.updatedField;

    await repost.save();
    res.status(200).json({ message: "Repost updated", data: repost });
  } catch (err) {
    console.error("Error editing repost:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getRepostById = async (req, res) => {
  try {
    const { repostId } = req.params;

    const repost = await PageRepost.findById(repostId)
      .populate({
        path: "pagePost",
        populate: {
          path: "pageId",
          select: "pageName profileImg",
        },
      })
      .populate({
        path: "pageId",
        select: "pageName profileImg",
      });

    if (!repost) {
      return res.status(404).json({ message: "Repost not found" });
    }

    res.status(200).json(repost);
  } catch (err) {
    console.error("Error fetching repost by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getRepostsByPageId = async (req, res) => {
  try {
    const { pageId } = req.params;

    const reposts = await PageRepost.find({ pageId })
      .populate({
        path: "pagePost",
        populate: {
          path: "pageId",
          select: "pageName profileImg",
        },
      })
      .populate({
        path: "pageId",
        select: "pageName profileImg",
      })
      .sort({ createdAt: -1 });

    res.status(200).json(reposts.length ? reposts : { message: "No reposts found for this page" });
  } catch (err) {
    console.error("Error fetching reposts by page ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const deletePageRepost = async (req, res) => {
  try {
    const { repostId } = req.params;
    const userId = req.user._id;

    const repost = await PageRepost.findOneAndDelete({ _id: repostId, user: userId });

    if (!repost) {
      return res.status(404).json({ message: "Repost not found" });
    }

    res.status(200).json({ message: "Repost deleted successfully" });
  } catch (err) {
    console.error("Error deleting repost:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};




const createPageRewrite = async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Page post not found" });
    }

    const alreadyRewritten = await PageRewrite.findOne({ user: userId, pagePost: postId });
    if (alreadyRewritten) {
      return res.status(400).json({ message: "Already rewritten this page post" });
    }

    const rewrite = await PageRewrite.create({
      user: userId,
      pagePost: postId,
      comment,
    });

    res.status(201).json({ message: "Rewrite created", data: rewrite });
  } catch (err) {
    console.error("Error creating page rewrite:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deletePageRewrite = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const rewrite = await PageRewrite.findOneAndDelete({ user: userId, pagePost: postId });

    if (!rewrite) {
      return res.status(404).json({ message: "Rewrite not found" });
    }

    res.status(200).json({ message: "Rewrite deleted successfully" });
  } catch (err) {
    console.error("Error deleting rewrite:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getRewritesByPostId = async (req, res) => {
  try {
    const { postId } = req.params;

    const rewrites = await PageRewrite.find({ pagePost: postId })
      .populate("user", "name username profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json(rewrites.length ? rewrites : { message: "No rewrites found" });
  } catch (err) {
    console.error("Error fetching rewrites:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getAllRewrites = async (req, res) => {
  try {
    const rewrites = await PageRewrite.find()
      .populate("user", "name username profileImg")
      .populate("pagePost")
      .sort({ createdAt: -1 });

    res.status(200).json(rewrites.length ? rewrites : { message: "No rewrites found" });
  } catch (err) {
    console.error("Error fetching all rewrites:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getRewritesByPageId = async (req, res) => {
  try {
    const { pageId } = req.params;

    const posts = await Post.find({ pageId }).select("_id");
    const postIds = posts.map(p => p._id);

    const rewrites = await PageRewrite.find({ pagePost: { $in: postIds } })
      .populate("user", "name username profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json(rewrites.length ? rewrites : { message: "No rewrites found for this page" });
  } catch (err) {
    console.error("Error fetching rewrites by page ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const pinRewrite = async (req, res) => {
  try {
    const { rewriteId } = req.params;

    const rewrite = await PageRewrite.findById(rewriteId);
    if (!rewrite) {
      return res.status(404).json({ message: "Rewrite not found" });
    }

    rewrite.pinned = !rewrite.pinned; // Toggle pinned
    await rewrite.save();

    res.status(200).json({ message: `Rewrite ${rewrite.pinned ? "pinned" : "unpinned"} successfully`, data: rewrite });
  } catch (err) {
    console.error("Error pinning/unpinning rewrite:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



module.exports = {
  createPageRepost,
  getAllPageReposts,
  getRepostsByPageId,
  editPageRepost,
  getRepostById,
  deletePageRepost,
  createPageRewrite,
  deletePageRewrite,
  getRewritesByPostId,
  getAllRewrites,
  getAllRewrites,
  getRewritesByPageId,
  pinRewrite,
  savePost,
  allSavedPost,
  allArchivedPost,
  setToPin,
  archivePost,
  actionLike,
};
