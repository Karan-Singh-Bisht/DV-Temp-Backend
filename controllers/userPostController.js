const Post = require("../models/userPostSchema");
const UserSavePosts = require("../models/userSavePosts");
const User = require("../models/User");
const Friendship = require("../models/friendshipSchema");
const Repost = require("../models/repostSchema")
const Rewrite = require("../models/rewriteSchema");
const ILikedPost = require("../models/iLikedPosts");
const { createNotification } = require("../controllers/NotificationUser");
const { visibilityFilter,visibilityPostFilter } = require("../controllers/visibilityController");


const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig");
const { findOne } = require("../models/visioFeed");

// Cloudinary storage for posts
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "post_media";

    if (file.mimetype.startsWith("video")) {
      folder = "post_videos";
    } else {
      folder = "post_images";
    }

    return {
      folder: folder,
      resource_type: file.mimetype.startsWith("video") ? "video" : "image",
      allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov"],
      public_id: `${Date.now()}-${file.originalname}`.replace(/\s+/g, "_"),
    };
  },
});

const uploadPostMedia = multer({
  storage: postStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

exports.createPost = [
  uploadPostMedia.fields([
    { name: "media", maxCount: 5 },
    { name: "coverPhoto", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),

  async (req, res) => {
    try {
      const {
        title,
        description,
        location,
        category,
        subCategory,
        isBlog,
        invitation,
        isCollaborated
      } = req.body;
      // Parse and structure media files
      const mediaURLs = req.files["media"]?.map((file) => ({
        path: file.path,
        public_id: file.filename,
      })) || [];

      const coverPhotoURL = req.files["coverPhoto"]?.[0]
        ? {
            path: req.files["coverPhoto"][0].path,
            public_id: req.files["coverPhoto"][0].filename,
          }
        : null;

      const videoURL = req.files["video"]?.[0]
        ? {
            path: req.files["video"][0].path,
            public_id: req.files["video"][0].filename,
          }
        : null;

      // Determine post type
      const postType = isBlog === "true" || isBlog === true
        ? "blog"
        : videoURL
        ? "video"
        : mediaURLs.length > 0
        ? "image"
        : "unknown";

      // Create new post
      const newPost = await Post.create({
        user: req.user._id,
        title,
        description,
        media: mediaURLs,
        coverPhoto: coverPhotoURL,
        video: videoURL,
        location,
        category: Array.isArray(category) ? category : [],
        subCategory: Array.isArray(subCategory) ? subCategory : [],
        likes: [],
        comments: [],
        shared: [],
        isBlocked: false,
        sensitive: false,
        isBlog,
        isCollaborated,
        invitation: Array.isArray(invitation) ? invitation : [invitation],
        mediatype: postType,
      });

      if (!newPost) {
        return res.status(400).json({ message: "Post creation failed" });
      }

      // Handle invitations and notifications
      if (Array.isArray(invitation)) {
        await Promise.all(
          invitation.map(async (id) => {
            await createNotification(
              id,
              req.user._id,
              "collab",
              `${req.user.name} has sent collabutation request.`
            );
          })
        );
      }

      res.status(201).json({
        message: "Post created successfully",
        data: newPost,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];


// exports.getPostById = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.postId).populate(
//       "user",
//       "name username profileImg"
//     );

//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     } else {
//       res.status(200).json({ data: post, message: "successfull" });
//     }
//   } catch (error) {
//     console.error("Error fetching post:", error);
//     res.status(500).json({ error: "An error occurred while fetching posts" });
//   }
// };

exports.getPostById = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.postId;

    // Fetch the post and populate user details
    const post = await Post.findById(postId).populate("user", "name username profileImg");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check visibility of the post for the user
    const visiblePost = await visibilityPostFilter(post, userId);
    if (!visiblePost) {
      return res.status(403).json({ message: "You are not authorized to view this post." });
    }

    // Check the friendship status between the user and the post's owner
    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: post.user._id },
        { requester: post.user._id, recipient: userId },
      ],
    });

    let friendshipStatus = "none";
    if (friendship) {
      friendshipStatus =
        friendship.status === "accepted" ? "looped" :
        friendship.status === "pending" ? "requested" : "none";
    }

    // Respond with the post and friendship status
    res.status(200).json({
      data: visiblePost,
      friendshipStatus,
      message: "Successful",
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "An error occurred while fetching the post." });
  }
};


// Get all user posts
exports.getPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch posts with the necessary filters and sorting
    const posts = await Post.find({
      user: userId,
      isBlocked: false,
      isArchived: false,
    })
      .populate("user", "name username profileImg") // Populate user details
      .sort({ pinned: -1, pinnedAt: -1, createdAt: -1 }); // Apply sorting criteria
    const filterData= await visibilityFilter(posts,userId)
    // Respond with posts or a clear message if no posts are found
    if (posts && posts.length > 0) {
      return res.status(200).json({ message:"Successful",data:filterData});
    } else {
      return res.status(404).json({ message: "No posts found" });
    }
  } catch (error) {
    console.error("Error fetching posts:", error.message);

    // Provide a descriptive error response
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected issue occurred while fetching posts. ",
    });
  }
};



// exports.getPosts = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const posts = await Post.find({
//       user: userId,
//       isBlocked: false,
//       isArchived: false,
//     })
//     .populate("user", "name username profileImg")
//     .sort({ pinned: -1, pinnedAt: -1, createdAt: -1 });

    
//     const postsWithFriendshipStatus = await Promise.all(posts.map(async (post) => {
//       const friendship = await Friendship.findOne({
//         $or: [
//           { requester: req.user._id, recipient: post.user._id },
//           { requester: post.user._id, recipient: req.user._id },
//         ],
//       });

//       let friendshipStatus = 'none';
//       if (friendship) {
//         friendshipStatus = friendship.status === 'accepted' ? 'looped' :
//                            friendship.status === 'pending' ? 'requested' : 'none';
//       }

//       return {
//         ...post.toObject(),
//         friendshipStatus,
//       };
//     }));

//     res.status(200).json(postsWithFriendshipStatus.length ? postsWithFriendshipStatus : { message: "No posts found" });
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


exports.updatePost = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      category,
      subCategory,
      postId,
      isBlog,
    } = req.body;


console.log(req.body);

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        title,
        description,
        location,
        category: Array.isArray(category) && category ,
        subCategory: Array.isArray(subCategory) && subCategory ,
        isBlog,
      },
      { new: true }
    );

    if (updatedPost) {
      res.status(200).json({ message: "Post updated successfully", data: updatedPost });
    } else {
      res.status(404).json({ message: "Post not found bb" });
    }
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.toggleDeletePost = async (req, res) => {
  try {
    const { postId } = req.params; // Extract the postId from the request parameters.

    // Find the post by its ID.
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Toggle the `isDeleted` field.
    post.isDeleted = !post.isDeleted;

    // Save the updated post to the database.
    await post.save();

    // Send a success response.
    res.status(200).json({
      message: `Post ${post.isDeleted ? "deleted" : "restored"} successfully`,
      post,
    });
  } catch (error) {
    console.error(error.message);

    // Handle errors gracefully.
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

 exports.getAllDeletedPosts = async (req, res) => {
  try {
    const userId= req.user._id

    // Fetch all posts with the specified `pageId` and `isDeleted: true`
    const deletedPosts = await Post.find({ user:userId, isDeleted: true }).populate("user", "name username profileImg")

    // Check if deleted posts are found
    if (!deletedPosts.length) {
      return res.status(404).json({success: false, message: "No deleted posts found" });
    }

    // Return the deleted posts
    return res.status(200).json({ success: true, data: deletedPosts });
  } catch (error) {
    console.error("Error fetching deleted posts:", error.message);
    return res.status(500).json({success: false, error: "An error occurred while fetching deleted posts." });
  }
};



// // Delete post
// exports.deletePost = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.postId);

//     if (!post) return res.status(404).json({ message: "Post not found" });

//     if (post.media) {
//       post.media.forEach((file) => {
//         cloudinary.uploader.destroy(file.public_id, (error, result) => {
//           if (error) console.error("Error deleting media:", error);
//         });
//       });
//     }

//     if (post.coverPhoto) {
//       cloudinary.uploader.destroy(
//         post.coverPhoto.public_id,
//         (error, result) => {
//           if (error) console.error("Error deleting cover photo:", error);
//         }
//       );
//     }

//     if (post.video) {
//       cloudinary.uploader.destroy(post.video.public_id, (error, result) => {
//         if (error) console.error("Error deleting video:", error);
//       });
//     }

//     const deletedPost = await Post.findByIdAndDelete(req.params.postId);
//     if (deletedPost) {
//       res.status(200).json({ message: "deleted successfully", success: true });
//     } else {
//       res.status(404).json({ message: "delete fail", success: false });
//     }
//   } catch (error) {
//     console.error("Error deleting post:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// Like or unlike a post
exports. likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" ,success:false });

    const userId = req.user._id;
    const likedPosts= await ILikedPost.findOne({userId})

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((like) => !like.equals(userId));
      await post.save();
      return res.status(200).json({ message: "Post unliked", post,success:true });
    } else {
      post.likes.push(userId);
      
     const savedLike= await post.save();

      return res.status(200).json({ message: "Post liked", post, success:true  });
    }
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    res.status(500).json({success:false, message: "Error liking/unliking post:"+error.message });
  }
};



// // Get all posts from every user
// exports.getAllPosts = async (req, res) => {
//   try {
    
    
//     const posts = await Post.find({
//       isBlocked: false,
//       isArchived: false,
//     }).populate("user", "name username profileImg");

//     if (!posts.length) {
//       return res.status(404).json({ message: "No posts found" });
//     }


//     const postsWithFriendshipStatus = await Promise.all(posts.map(async (post) => {
//       const friendship = await Friendship.findOne({
//         $or: [
//           { requester: req.user.id, recipient: post.id },
//           { requester: post.id, recipient: req.user.id }
//         ]
//       });

//       let friendshipStatus = 'none';
//       if (friendship) {
//         friendshipStatus = friendship.status === 'accepted' ? 'looped' :
//                            friendship.status === 'pending' ? 'requested' : 'none';
//       }

//       return { ...post.toObject(), friendshipStatus,};
//     }));

//     res.status(200).json({ data: postsWithFriendshipStatus, message: "Successful" });
    
//   } catch (error) {
//     console.error("Error fetching all posts:", error);
//     res.status(500).json({ message: error.message });
//   }
// };



// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    // Fetch posts that are not blocked or archived and populate the user field
    const posts = await Post.find({
      isBlocked: false,
      isArchived: false,
    }).populate("user", "name username profileImg _id");

    if (!posts.length) {
      return res.status(404).json({ message: "No posts found" });
    }

    // Map through posts to include friendship status
    const postsWithFriendshipStatus = await Promise.all(
      posts.map(async (post) => {
        const user = post.user;
        if (!user) {
          return null; // Skip posts with missing user data
        }

        // Check friendship status between the logged-in user and the post's user
        const friendship = await Friendship.findOne({
          $or: [
            { requester: req.user.id, recipient: user._id },
            { requester: user._id, recipient: req.user.id },
          ],
        });

        let friendshipStatus = "none";
        if (friendship) {
          friendshipStatus =
            friendship.status === "accepted"
              ? "looped"
              : friendship.status === "pending"
              ? "requested"
              : "none";
        }

        // Return the post with friendship status
        return {
          ...post.toObject(),
          friendshipStatus,
        };
      })
    );

    // Filter out null posts and send the response
    const validPosts = postsWithFriendshipStatus.filter((post) => post !== null);
    res.status(200).json({data:validPosts});
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all posts of a specific user by user ID
exports.getPostsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({
      user: userId,
      isBlocked: false,
      isArchived: false,
    })
      .sort({ pinned: -1, pinnedAt: -1, createdAt: -1 })
      .populate("user", "name username profileImg");

    if (!posts.length) {
      return res.status(404).json({ message: "No posts found for this user" });
    }

    // Filter posts based on friendship status
    const postsFromFriends = await Promise.all(
      posts.map(async (post) => {
        const friendship = await Friendship.findOne({
          $or: [
            { requester: req.user._id, recipient: post.user._id },
            { requester: post.user._id, recipient: req.user._id },
          ],
          status: 'accepted', // Filter directly by status
        });

        // Only include the post if the friendship is accepted
        if (friendship) {
          return { ...post.toObject(), friendshipStatus: 'looped' };
        }

        return null; // Exclude posts from non-friends
      })
    );

    // Filter out null values (non-friend posts)
    const filteredPosts = postsFromFriends.filter((post) => post !== null);

    if (!filteredPosts.length) {
      return res.status(404).json({ message: "No posts found for this user" });
    }

    res.status(200).json({ data: filteredPosts, message: "Successful" });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ error: "An error occurred while fetching posts" });
  }
};


// Save or unsave a post
exports.saveOrUnsavePost = async (req, res) => {
  try {
    const postId = req.params.saveId;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post saving / deleted fail" });
    }

    let userSave = await UserSavePosts.findOne({ user: userId });

    if (!userSave) {
      userSave = new UserSavePosts({ user: userId, savedPosts: [] });
    }

    const postIndex = userSave.savedPosts.indexOf(postId);
    if (postIndex > -1) {
      userSave.savedPosts.splice(postIndex, 1);
      await userSave.save();
      return res.status(200).json({
        message: "Saved Post Deleted successfully",
        success: true,
      });
    } else {
      userSave.savedPosts.push(postId);
      await userSave.save();
      return res.status(200).json({
        message: "Post saved successfully",
        success: true,
      });
    }
  } catch (error) {
    console.error("Error saving/unsaving post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// // Get all saved posts of the user
// exports.getSavedPosts = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const userSave = await UserSavePosts.findOne({ user: userId }).populate(
//       "savedPosts"
//     );

//     if (!userSave || userSave.savedPosts.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No saved posts found", success: false });
//     }

//     res
//       .status(200)
//       .json({
//         data: userSave.savedPosts,
//         success: true,
//         message: "successfully",
//       });
//   } catch (error) {
//     console.error("Error fetching saved posts:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


// Get all saved posts of the user
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const userSave = await UserSavePosts.findOne({ user: userId })
    .populate({
      path: 'savedPosts', // First populate savedPosts
      populate: {
        path: 'user', // Then populate the user field within each post in savedPosts
        select: 'name username profileImg' // Select the fields you need
      }
    })
    .populate("user", "name username profileImg"); // Also populate the main user reference
  
    if (!userSave || userSave.savedPosts.length === 0) {
      return res.status(404).json({ message: "No saved posts found", success: false });
    }

    const savedPostsWithFriendshipStatus = await Promise.all(
      userSave.savedPosts.map(async (post) => {
        const friendship = await Friendship.findOne({
          $or: [
            { requester: req.user._id, recipient: post.user },
            { requester: post.user, recipient: req.user._id },
          ],
        });

        let friendshipStatus = 'none';
        if (friendship) {
          friendshipStatus = friendship.status === 'accepted' ? 'looped' :
                             friendship.status === 'pending' ? 'requested' : 'none';
        }
        
        return { ...post.toObject(), friendshipStatus };
      })
    );

    res.status(200).json({
      data: savedPostsWithFriendshipStatus,
      
      success: true,
      message: "Successfully fetched saved posts",
    });
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Functions which have to update the API documentation

exports.togglePinPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    if (post.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to pin/unpin this post" });
    }
    const pinnedCount = await Post.countDocuments({
      user: userId,
      pinned: true,
    });

    if (post.pinned) {
      post.pinned = false;
      
    } else {
      if (pinnedCount >= 3) {
        return res
          .status(400)
          .json({ error: "You can only pin up to 3 posts" });
      }
      post.pinned = true;
      post.pinnedAt = new Date();
    }
    await post.save();

    return res.status(200).json({ message: ` successfully`, success: true });
  } catch (error) {
    console.error("Error toggling pin status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.archivePost = async (req, res, next) => {
  // userId = req.user._id;
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }
    if (post.user.toString() !== userId) {
      return res.status(401).json({
        message: "You are not authorized to archive/unarchive this post",
      });
    }

    post.isArchived = !post.isArchived;
    await post.save();

    res.status(200).json({
      message: post.isArchived
        ? "Post archived successfully"
        : "Post unarchived successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error archiving/unarchiving post:", error);
    res.status(500).json({ error: "Error updating the post", error });
  }
};

exports.getArchivedPosts = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const archivedPosts = await Post.find({ user: userId, isArchived: true })
      .populate("user", "name username profileImg")
      .sort({ createdAt: -1 });

    if (!archivedPosts.length) {
      return res
        .status(404)
        .json({ success: true, message: "fail to fetch archived data" });
    }

    //res.status(200).json(archivedPosts);
    res.status(200).json({ data: archivedPosts, message: "Archieved post Fetched successfully" });
  } catch (error) {
    console.error("Error fetching archived posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getArchivedPostById = async (req, res, next) => {
  const { postId: postId } = req.params;
  const userId = req.user.postId;

  try {
    const post = await Post.findOne({
      _id: postId,
      isArchived: true,
      user: userId,
    }).populate("user", "name username profileImg");

    if (!post) {
      return res.status(404).json({ message: "Archived post not found" });
    }

    res.status(200).json({ data: post, message: "Fetch successfully" });
  } catch (error) {
    console.error("Error fetching archived post:", error);
    res.status(500).json({ error: error.message });
  }
};



//repost
exports.createRepost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return res.status(404).json({ message: "Original post not found" });
    }
    const newRepost = await Repost.create({
      user: userId,
      originalPost: postId,
    });
    res.status(201).json({ message: "Post reposted successfully", data: newRepost });
  } catch (error) {
    console.error("Error creating repost:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getUserReposts = async (req, res) => {
  try {
    const userId = req.user._id;

    const reposts = await Repost.find({ user: userId })
      .populate({
        path: "originalPost",
        populate: { path: "user", select: "name username profileImg" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(reposts.length ? reposts : { message: "No reposts found" });
  } catch (error) {
    console.error("Error fetching reposts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



exports.getRepostsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;

    const reposts = await Repost.find({ originalPost: postId })
      .populate("user", "name username profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json(reposts.length ? reposts : { message: "No reposts for this post" });
  } catch (error) {
    console.error("Error fetching reposts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};







// Function to create a tweet (retweet)
exports.createRewrite = async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;

    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return res.status(404).json({ message: "Original post not found" });
    }

    // Check if user has already retweeted the post
    const existingRewrite = await Rewrite.findOne({
      user: req.user._id,
      originalPost: postId,
    });

    if (existingRewrite) {
      return res.status(400).json({ message: "Already retweeted this post" });
    }

    // Create a new rewrite entry
    const newRewrite = await Rewrite.create({
      user: req.user._id,
      originalPost: postId,
      comment,
    });

    // Increment sharedCount in original post
    originalPost.sharedCount += 1;
    await originalPost.save();

    res.status(201).json({
      message: "Post retweeted successfully",
      data: newRewrite,
    });
  } catch (error) {
    console.error("Error creating retweet:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to get retweets of a post
exports.getRewrites = async (req, res) => {
  try {
    const { postId } = req.params;

    const retweets = await Rewrite.find({ originalPost: postId })
      .populate("user", "name username profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json(retweets.length ? retweets : { message: "No retweets found" });
  } catch (error) {
    console.error("Error fetching retweets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to remove a retweet
exports.deleteRewrite = async (req, res) => {
  try {
    const { postId } = req.params;

    const rewrite = await Rewrite.findOneAndDelete({
      user: req.user._id,
      originalPost: postId,
    });

    if (!rewrite) {
      return res.status(404).json({ message: "Retweet not found" });
    }

    // Decrement sharedCount in original post
    const originalPost = await Post.findById(postId);
    if (originalPost) {
      originalPost.sharedCount -= 1;
      await originalPost.save();
    }

    res.status(200).json({ message: "Retweet removed successfully" });
  } catch (error) {
    console.error("Error removing retweet:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.iLikedPost = async (req,res)=>{
  const userId= req.user._id

  const likedPosts= []
}

exports.changeStatusCollaboration = async (req, res) => {
  try {
    const { postId, status } = req.params; // Extract postId and status from params
    const userId = req.user._id; // Get userId from the authenticated user

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if(!post.invitation.includes(userId.toString())){
  return res.status(404).json({ message: 'You Haven\'t any invitaton' });

}
    // Remove the userId from the invitation array
    post.invitation = post.invitation.filter(id => id.toString() !== userId.toString());

    // Handle the collaboration status
    if (status === 'accept') {
      // Add the userId to the user array if not already present
      if (!post.user.includes(userId)) {
        post.user.push(userId);
      }
    }

    // Save the updated post
    await post.save();

    // Return success response based on the status
    const message =
      status === 'accept'
        ? 'Collaboration accepted successfully'
        : 'Collaboration declined successfully';

    return res.status(200).json({ message });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


