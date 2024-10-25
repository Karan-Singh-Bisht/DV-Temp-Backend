const PostModel = require("../../models/Pages/postSchema");
const UserModel = require("../../models/User");
const createHttpError = require("http-errors");
const cloudinary = require("../../config/cloudinaryConfig");

const createPost = async (req, res) => {
  try {
    const {
      title,
      pageId,
      description,
      location,
      category,
      subCategory,
      isBlog,
    } = req.body;

    const mediaURLs = req.files["media"]
      ? req.files["media"].map((file) => ({
          path: file.path,
          public_id: file.filename,
        }))
      : [];

    const coverPhotoURL = req.files["coverPhoto"]
      ? {
          path: req.files["coverPhoto"][0].path,
          public_id: req.files["coverPhoto"][0].filename,
        }
      : null;

    const videoURL = req.files["video"]
      ? {
          path: req.files["video"][0].path,
          public_id: req.files["video"][0].filename,
        }
      : null;

    // Validate required fields
    let postType = "";

    if (mediaURLs.length) {
      postType = "image";
    } else if (videoURL) {
      postType = "video";
    }

    // Create new post
    const newPost = await PostModel.create({
      pageId,
      title,
      description,
      media: mediaURLs,
      coverPhoto: coverPhotoURL,
      video: videoURL,
      location,
      category: Array.isArray(category) ? category : [category],
      subCategory: Array.isArray(subCategory) ? subCategory : [subCategory],
      likes: [],
      comments: [],
      shared: [],
      isBlocked: false,
      sensitive: false,
      isBlog,
      mediatype: postType,
    });

    // // Fetch the associated user by pageId
    // const user = await Pages.findById(pageId).select(
    //   "name username following followers profession"
    // );

    // if (!user) {
    //   return res.status(404).json({ error: "User not found" });
    // }

    // Respond with the post and user data
    if (!newPost) {
      return res.status(400).json({ message: "Page creation failed" });
    } else {
      res.status(201).json({
        data: newPost,
        message: "Created",
      });
    }
  } catch (error) {
    // Log the error and send a response
    console.error("Error creating post:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const id = req.params.postId;
    const post = await PostModel.findById(id);
    if (post) {
      return res.status(200).json({
        data: post,
        message: "Successful",
      });
    } else {
      return res.status(400).json({
        message: "No posts found",
      });
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching posts:", error);

    // Return 500 (Internal Server Error) with a generic message
    return res.status(500).json({
      error: "An error occurred while fetching posts",
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const pageId = req.params.pageId;
    const allPagePosts = await PostModel.find({
      pageId,
      isArchive: false,
    }).sort({ isPinned: -1, pinCreatedAt: -1 });

    if (allPagePosts) {
      return res.status(200).json({
        data: allPagePosts,
        message: "Successful",
      });
    } else {
      return res.status(400).json({
        message: "No posts found",
      });
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching posts:", error);

    // Return 500 (Internal Server Error) with a generic message
    return res.status(500).json({
      error: "An error occurred while fetching posts",
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const allPagePosts = await PostModel.find({ isArchive: false });
    if (allPagePosts) {
      return res.status(200).json({
        data: allPagePosts,
        message: "Successful",
      });
    } else {
      return res.status(404).json({
        message: "No posts found",
      });
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching posts:", error);

    // Return 500 (Internal Server Error) with a generic message
    return res.status(500).json({
      message: error.message,
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const {
      title,
      postId,
      description,
      location,
      category,
      subCategory,
      isBlog,
      isArchive,
    } = req.body;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Update media URLs, cover photo, and video if provided, otherwise retain existing

    const coverPhotoURL =
      req.files && req.files["coverPhoto"]
        ? {
            path: req.files["coverPhoto"][0].path,
            public_id: req.files["coverPhoto"][0].filename,
          }
        : post.coverPhoto;

    // Update the post with new values
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      {
        title,
        description,
        coverPhoto: coverPhotoURL,
        location,
        isArchive,
        category: Array.isArray(category) ? category : [category],
        subCategory: Array.isArray(subCategory) ? subCategory : [subCategory],
        isBlog,
      },
      { new: true } // This returns the updated document
    );
    if (updatePost) {
      res.status(200).json({
        data: updatedPost,
        message: "Post updated successfully",
      });
    } else {
      res.status(404).json({
        message: "Post updated fail",
      });
    }
  } catch (error) {
    // Log the error and send a response
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const id = req.params.postId;

    const isPost = await PostModel.findById(id);
    if (isPost) {
      // Delete media images
      if (isPost.media) {
        isPost.media.map((file) => {
          cloudinary.uploader.destroy(file.public_id, (error, result) => {
            if (error) {
              console.error("Error deleting image:", error);
            } else {
              console.log("Image deleted successfully:", result);
            }
          });
        });
      }
      // Delete cover photo
      if (isPost.coverPhoto) {
        cloudinary.uploader.destroy(
          isPost.coverPhoto.public_id,
          (error, result) => {
            if (error) {
              console.error("Error deleting cover photo:", error);
            } else {
              console.log("Cover photo deleted successfully:", result);
            }
          }
        );
      }
      // Delete video
      if (isPost.video) {
        cloudinary.uploader.destroy(isPost.video.public_id, (error, result) => {
          if (error) {
            console.error("Error deleting video:", error);
          } else {
            console.log("Video deleted successfully:", result);
          }
        });
      }
    }

    // Delete the post
    const deletedPost = await PostModel.findByIdAndDelete(id);
    console.log(deletedPost); // Log the deleted post

    if (deletedPost) {
      return res
        .status(200)
        .json({ success: true, message: "Deleted successfully" });
    }
    return res.status(404).json({ success: false, message: "Delete failed" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPost,
  getPostById,
  getPosts,
  getAllPosts,
  updatePost,
  deletePost,
};
