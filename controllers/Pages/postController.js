const PostModel = require("../../models/Pages/postSchema");
const Media = require('../../models/visioFeed');
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
console.log(cadURL);

    // Determine postType based on isBlog and media presence
    let createData = [];
    if (cadURL) {
      createData.push(cadURL); // Add cad file
    }
    if (mediaURLs.length > 0) {
      createData.push(...mediaURLs); // Add media files
    }
    if (videoURL) {
      createData.push(videoURL); // Add video
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
    console.error("Error creating post:",error.message);
    res.status(500).json({ error: error.message });
  }
};


const getPostById = async (req, res) => {
  try {
    const id = req.params.postId;
    const post = await PostModel.findById(id).populate("pageId", "pageName date_of_birth gender userName profileImg");
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
    }).sort({ pinned: -1, pinnedAt: -1 ,createdAt:-1 }).populate("pageId", "pageName  userName profileImg");

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
    const allPagePosts = await PostModel.find({ isArchive: false }).populate("pageId", "pageName date_of_birth gender userName profileImg");
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
    ).populate("pageId", "pageName date_of_birth gender userName profileImg");
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

    // Find the post by its ID
    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Toggle the `isDeleted` field
    post.isDeleted = !post.isDeleted;

    // Save the updated post to the database
    await post.save();

    // Send a success response
    return res.status(200).json({
      message: `Post ${post.isDeleted ? "deleted" : "restored"} successfully`,
      post,
    });
  } catch (error) {
    console.error("Error deleting/restoring post:", error.message);
    return res.status(500).json({ error: "An error occurred while processing the request." });
  }
};

const getAllDeletedPosts = async (req, res) => {
  try {
    const { pageId } = req.params;

    // Fetch all posts with the specified `pageId` and `isDeleted: true`
    const deletedPosts = await PostModel.find({ pageId, isDeleted: true }).populate("pageId", "pageName date_of_birth gender userName profileImg");

    // Check if deleted posts are found
    if (!deletedPosts.length) {
      return res.status(404).json({success : false, message: "No deleted posts found" });
    }

    // Return the deleted posts
    return res.status(200).json({success : true, message: 'Get all deleted post fetched successully', data: deletedPosts });
  } catch (error) {
    console.error("Error fetching deleted posts:", error.message);
    return res.status(500).json({ success : false,error: "An error occurred while fetching deleted posts." });
  }
};




// const getCombinedPosts = async (req, res) => {
//   try {
    
//     const allPagePosts = await PostModel.find({ isArchive: false })
//       .populate("pageId", "pageName userName profileImg") 
//       .lean();

//     const allFeeds = await Media.find({}).lean();

//     const normalizedPagePosts = allPagePosts.map((post) => ({
//       type: "pagePost",
//       id: post._id,
//       title: post.title,
//       description: post.description,
//       media: post.media,
//       createdAt: post.createdAt,
//       pageDetails: post.pageId, 
//       //isBlog: post.isBlog,
//       platform: 'Devi',
//       location: post.location,
//       category: post.category,
//       subCategory: post.subCategory,
//       mediatype: post.mediatype,
//     }));

//     const normalizedFeeds = allFeeds.map((feed) => ({
//       type: "feedPost",
//       id: feed._id,
//       description: feed.description,
//       media: feed.mediaUrl, 
//       createdAt: feed.createdAt,
//       platform: feed.platform,
//       username: feed.usernameOrName,
//       location: feed.location,
//       category: feed.categories,
//       subCategory: feed.subCategories,
//     }));

   
//     const combinedPosts = [...normalizedPagePosts, ...normalizedFeeds];

//     combinedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    
//     res.status(200).json({
//       data: combinedPosts,
//       message: "Successfully fetched combined posts",
//     });
//   } catch (error) {
//     console.error("Error fetching combined posts:", error);
//     res.status(500).json({ message: "Error fetching combined posts", error: error.message });
//   }
// };


const getCombinedPosts = async (req, res) => {
  try {
    
    const allPagePosts = await PostModel.find({ isArchive: false })
      .populate("pageId", "pageName date_of_birth gender userName profileImg")
      .lean();

    
    const allFeeds = await Media.find({}).lean();

    
    const determineMediaType = (url) => {
      const extension = url.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
        return 'image';
      }
      if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(extension)) {
        return 'video';
      }
      return 'unknown'; 
    };

    
    const normalizedPagePosts = allPagePosts.map((post) => ({
      type: "pagePost",
      id: post._id,
      title: post.title,
      description: post.description,
      media: post.media,
      createdAt: post.createdAt,
      pageDetails: post.pageId,
      platform: "Devi",
      location: post.location,
      category: post.category,
      subCategory: post.subCategory,
      mediatype: post.mediatype,
    }));

    
    const normalizedFeeds = allFeeds.map((feed) => ({
      type: "feedPost",
      id: feed._id,
      description: feed.description,
      media: feed.mediaUrl,
      createdAt: feed.createdAt,
      platform: feed.platform,
      username: feed.usernameOrName,
      location: feed.location,
      category: feed.categories,
      subCategory: feed.subCategories,
      mediatype: feed.mediaUrl.length > 0 ? determineMediaType(feed.mediaUrl[0]) : "unknown", 
    }));

   
    const combinedPosts = [...normalizedPagePosts, ...normalizedFeeds];

    
    combinedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    
    res.status(200).json({
      data: combinedPosts,
      message: "Successfully fetched combined posts",
    });
  } catch (error) {
    console.error("Error fetching combined posts:", error);
    res.status(500).json({ message: "Error fetching combined posts", error: error.message });
  }
};



module.exports = {
  createPost,
  getPostById,
  getPosts,
  getAllPosts,
  updatePost,
  deletePost,
  getAllDeletedPosts,
  createCadPost,
  getCombinedPosts,
};