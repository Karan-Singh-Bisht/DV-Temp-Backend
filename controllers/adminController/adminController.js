const Admin = require("../../models/adminModel");
const Media = require("../../models/visioFeed");
const UserAvatar = require("../../models/userAvatarSchema");
const PageAvatar = require("../../models/Pages/pageAvatarSchema");
const { signToken } = require("../../utils/jwtUtils");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinaryConfig");
const multer = require("multer");
const User = require("../../models/User");
const Pages = require("../../models/Pages/PagesModel");
const Post = require("../../models/Pages/postSchema");
const Infonics = require("../../models/Infonics");
const CreatorPageAvatar = require('../../models/Pages/creatorPageAvatarSchema');

// Login function
exports.login = async function (req, res) {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: "Invalid user" });
    }

    const token = signToken(admin._id);
    // console.log("varanille data:" + admin._id);

    res.cookie("token", token, {
      expires: new Date(Date.now() + 86400000),
      httpOnly: true,
    });

    res.json({ token, adminId: admin._id, username: admin.username });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Configure Cloudinary storage for media uploads (images/videos)
const mediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    if (!file || !file.mimetype) {
      console.log("Invalid file");
    }

    let folder = "admin_post_media";
    if (file.mimetype.startsWith("video")) {
      folder = "admin_post_videos";
    }

    return {
      folder: folder,
      resource_type: file.mimetype.startsWith("video") ? "video" : "image",
      allowed_formats: ["jpg", "jpeg", "webp", "png", "mp4", "mov"],
    };
  },
});

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: "Server error during upload" });
  }
  next();
};

// Multer middleware for handling media uploads
const uploadMedia = multer({ storage: mediaStorage });

// Create post (Admin)
exports.createPost = [
  uploadMedia.fields([{ name: "mediaUrl", maxCount: 5 }]),
  multerErrorHandler,
  async (req, res) => {
    try {
      const {
        description,
        platform,
        usernameOrName,
        location,
        categories,
        subCategories,
      } = req.body;

      //For Debugging

      // console.log("BODY:", req.body);
      // console.log("FILES:", JSON.stringify(req.files, null, 2));

      const mediaURLs = req.files["mediaUrl"]
        ? req.files["mediaUrl"].map((file) => file.path)
        : [];

      if (!description || !platform || !usernameOrName || !mediaURLs.length) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const parsedSubCategories = (() => {
        try {
          return JSON.parse(subCategories);
        } catch {
          return [subCategories];
        }
      })();

      const newPost = new Media({
        mediaUrl: mediaURLs,
        description,
        platform,
        usernameOrName,
        location,
        categories,
        //categories: Array.isArray(categories) ? categories : [categories],
        subCategories: parsedSubCategories,
      });

      await newPost.save();

      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error creating post:", error);
      return res
        .status(500)
        .json({ message: "Error creating post", error: error.message });
    }
  },
];

exports.updatePost = [
  uploadMedia.fields([{ name: "mediaUrl", maxCount: 5 }]),
  async (req, res) => {
    const postId = req.params.id;

    try {
      const {
        description,
        platform,
        usernameOrName,
        location,
        categories,
        subCategories,
      } = req.body;

      const mediaURLs =
        req.files && req.files["mediaUrl"]
          ? req.files["mediaUrl"].map((file) => file.path)
          : null;

      const updateData = {
        description,
        platform,
        usernameOrName,
        location,
        categories,
        //categories: Array.isArray(categories) ? categories : [categories],
        subCategories: Array.isArray(subCategories)
          ? subCategories
          : [subCategories],
      };

      if (mediaURLs) {
        updateData.mediaUrl = mediaURLs[0];
      }

      const updatedPost = await Media.findByIdAndUpdate(postId, updateData, {
        new: true,
      });

      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(updatedPost);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error updating post", error: err.message });
    }
  },
];

// Delete a post by ID
exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  console.log("id ethann: " + postId);
  try {
    const deletedPost = await Media.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting post", error: err.message });
  }
};

// Get all feeds (posts)
exports.getAllFeeds = async (req, res) => {
  try {
    const feeds = await Media.find({});
    if (!feeds || feeds.length === 0) {
      return res.status(404).json({ message: "No feeds found" });
    }
    res.json(feeds);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching feeds", error: err.message });
  }
};

// Get a single feed by ID
exports.getFeedById = async (req, res) => {
  const postId = req.params.id;

  try {
    const feed = await Media.findById(postId);
    if (!feed) {
      return res.status(404).json({ message: "Feed not found" });
    }
    res.json(feed);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching feed", error: err.message });
  }
};

//Delete a visioFeed
exports.deleteVisionFeed = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ message: "Id is required!" });
    }

    const response = await Media.findByIdAndDelete(id);

    if (!response) {
      return res
        .status(404)
        .json({ message: "No media found with the given id" });
    }

    res
      .status(200)
      .json({ message: "Media deleted successfully", data: response });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed", error: err.message });
  }
};

exports.uploadUserAvatar = async (req, res) => {
  try {
    const { category } = req.body;

    // Extract avatar details from the uploaded files
    const avatarFile = req.files["avatar"]?.[0];
    if (!avatarFile) {
      return res.status(400).json({ message: "Avatar is required" });
    }

    const avatarUrl = {
      path: avatarFile.path,
      public_id: avatarFile.filename,
    };

    // Create a new UserAvatar instance
    const newAvatar = new UserAvatar({
      category,
      avatarName: avatarUrl,
    });

    // Save the avatar to the database
    await newAvatar.save();

    res.status(200).json({
      message: "Avatar uploaded successfully",
      avatar: avatarUrl,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.uploadPageAvatar = async (req, res) => {
  try {
    const { category } = req.body;

    // Extract avatar details from the uploaded files
    const avatarFile = req.files["avatar"]?.[0];
    if (!avatarFile) {
      return res.status(400).json({ message: "Avatar is required" });
    }

    const avatarUrl = {
      path: avatarFile.path,
      public_id: avatarFile.filename,
    };

    // Create a new UserAvatar instance
    const newAvatar = new PageAvatar({
      category,
      avatarName: avatarUrl,
    });

    // Save the avatar to the database
    await newAvatar.save();
    res.status(200).json({
      message: "Avatar uploaded successfully",
      avatar: avatarUrl,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.uploadCreatorPageAvatar = async (req, res) => {
  try {
    const { category } = req.body;

    // Validate uploaded file
    const avatarFile = req.files["avatar"]?.[0];
    if (!avatarFile) {
      return res.status(400).json({ message: "Avatar is required" });
    }

    const avatarUrl = {
      path: avatarFile.path,
      public_id: avatarFile.filename,
    };

    // Save avatar to CreatorPageAvatar collection
    const newAvatar = new CreatorPageAvatar({
      category,
      avatarName: avatarUrl,
    });

    await newAvatar.save();

    res.status(200).json({
      message: "Creator Page avatar uploaded successfully",
      avatar: avatarUrl,
    });
  } catch (error) {
    console.error("Error uploading creator avatar:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
 
//get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).json({ message: "No User found" });
    }
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//get a particular user
exports.getUserDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user details:", err.message);
    res.status(500).json({ message: "Internal Server Error", err });
  }
};

//delete a user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all pages created by the user
    const pages = await Pages.find({ userId: id });

    // Collect page IDs
    const pageIds = pages.map((page) => page._id);

    // Delete user
    await User.findByIdAndDelete(id);

    // Delete pages created by the user
    await Pages.deleteMany({ userId: id });

    // Delete posts associated with those pages
    await Post.deleteMany({ pageId: { $in: pageIds } });

    res.status(200).json({
      message: "User and associated pages & posts deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

//get all pages
exports.getAllPages = async (req, res) => {
  try {
    const pages = await Pages.find();
    if (!pages) {
      return res.status(404).json({ message: "Pages not found!!" });
    }
    res.status(200).json(pages);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
};

//get Particular page
exports.getPageDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Pages.findById(id);
    if (!page) {
      return res.status(404).json({ message: "page not found" });
    }
    res.status(200).json(page);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error!", err });
  }
};

//delete page
exports.deletePage = async (req, res) => {
  const { id } = req.params;

  try {
    const page = await Pages.findById(id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    await Post.deleteMany({ pageId: id });
    await Pages.findByIdAndDelete(id);

    res.status(200).json({ message: "Page deleted successfully" });
  } catch (err) {
    console.error("Error deleting page:", err.message);
    res.status(500).json({ message: "Internal Server Error", err });
  }
};

//get all page posts
exports.getAllPagePosts = async (req, res) => {
  try {
    const pagePosts = await Post.find().populate("pageId");
    if (!pagePosts) {
      return res.status(404).json({ message: "Page posts not found" });
    }
    res.status(200).json(pagePosts);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
};

exports.getPagePost = async (req, res) => {
  const { id } = req.params;
  try {
    const pagePost = await Post.findById(id).populate("pageId");
    if (!pagePost) {
      return res.status(404).json({ message: "Page Post not found" });
    }
    res.status(200).json(pagePost);
  } catch (err) {
    res.status(500).json({ message: "Could Not Find Post", err });
  }
};

//get all infocards
exports.getInfoCards = async (req, res) => {
  try {
    const infoCards = await Infonics.find().populate("pageId");
    if (!infoCards) {
      return res.status(404).json({ message: "No info cards found" });
    }
    res.status(200).json(infoCards);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
};

exports.getInfoCard = async (req, res) => {
  const { id } = req.params;
  try {
    const infoCard = await Infonics.findById(id).populate("pageId");
    if (!infoCard) {
      return res.status(404).json({ message: "No card found" });
    }
    res.status(200).json(infoCard);
  } catch (err) {
    res.status(500).json({ message: "No Info Card found", err });
  }
};
