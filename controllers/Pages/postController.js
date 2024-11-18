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
     
      coPartner
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
      const musicURL = req.files["music"]
      ? {
          path: req.files["music"][0].path,
          public_id: req.files["music"][0].filename,
        }
      : null;


    const videoURL = req.files["video"]
      ? {
          path: req.files["video"][0].path,
          public_id: req.files["video"][0].filename,
        }
      : null;
      const cadURL = req.files["cad"]
      ? {
          path: req.files["cad"][0].path,
          public_id: req.files["cad"][0].filename,
        }
      : null;

    // Determine postType based on isBlog and media presence
    let postType = "";
    if (isBlog === "true" || isBlog === true) {
      postType = "blog";
    } else if (videoURL) {
      postType = "video";
    } else if (mediaURLs.length > 0) {
      postType = "image";
    } else if (cadURL) {
      postType = "cad";
    }else {
      postType = "unknown"; // or any other default you want
    }

    // Create new post
    const newPost = await PostModel.create({
      pageId,
      title,
      description,
      media: mediaURLs,
      coverPhoto: coverPhotoURL,
      video: videoURL,
      cad:cadURL,
      location,
      category: category ? category : [],
      subCategory: subCategory ? subCategory : [],
      coPartner,
      music:musicURL,
      likes: [],
      comments: [],
      shared: [],
      isBlocked: false,
      sensitive: false,
      isBlog,
      mediatype: postType,
    });

    if (!newPost) {
      return res.status(400).json({ message: "Page creation failed" });
    } else {
      res.status(201).json({
        data: newPost,
        message: "Created",
      });
    }
  } catch (error) {
    console.error("Error creating post:",error);
    res.status(500).json({ error: error.message });
  }
};
const createCadPost = async (req, res) => {
  try {
    const {
      title,
      pageId,
      description,
      location,
      category,
      subCategory,
      isBlog,
      coPartner
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
      const musicURL = req.files["music"]
      ? {
          path: req.files["music"][0].path,
          public_id: req.files["music"][0].filename,
        }
      : null;


    const videoURL = req.files["video"]
      ? {
          path: req.files["video"][0].path,
          public_id: req.files["video"][0].filename,
        }
      : null;
      const cadURL = req.files["cad"]
      ? {
          path: req.files["cad"][0].path,
          public_id: req.files["cad"][0].filename,
        }
      : null;

    // Determine postType based on isBlog and media presence

    let createData = null;
if (mediaURLs.length > 0) {
  createData = mediaURLs;
} else if (videoURL) {
  createData = videoURL;
} else {
  createData = cadURL;
}
    // Create new post
    const newPost = await PostModel.create({
      pageId,
      title,
      description,
      coverPhoto: coverPhotoURL,
      cad:createData,
      location,
      category: category ? category : [],
      subCategory: subCategory ? subCategory : [],
      coPartner,
      music:musicURL,
      likes: [],
      comments: [],
      shared: [],
      isBlocked: false,
      sensitive: false,
      isBlog,
      mediatype: 'cad',
    });

    if (!newPost) {
      return res.status(400).json({ message: "Page creation failed" });
    } else {
      res.status(201).json({
        data: newPost,
        message: "Created",
      });
    }
  } catch (error) {
    console.error("Error creating post:",error);
    res.status(500).json({ error: error.message });
  }
};


const getPostById = async (req, res) => {
  try {
    const id = req.params.postId;
    const post = await PostModel.findById(id).populate("pageId", "pageName userName profileImg");
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
    }).sort({ pinned: -1, pinnedAt: -1 ,createdAt:-1 }).populate("pageId", "pageName userName profileImg");

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
    const allPagePosts = await PostModel.find({ isArchive: false }).populate("pageId", "pageName userName profileImg");
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
        category: category ? category : [],
        subCategory: subCategory ? subCategory : [],
        isBlog,
      },
      { new: true } // This returns the updated document
    ).populate("pageId", "pageName userName profileImg");
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
  createCadPost
};
