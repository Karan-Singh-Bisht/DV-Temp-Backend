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
const ReportUser = require("../../models/reportUserSchema");
const UserVerification = require("../../models/userVerification");
const BusinessVerification = require("../../models/Pages/businessVerification");
const VisioFeedSave = require("../../models/visioFeedSaveModel");
const CreatorVerification = require("../../models/Pages/creatorVerification");
const PageReport = require("../../models/Pages/reportPageSchema");
const jwt = require("jsonwebtoken");

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
      httpOnly: true,
      expires: new Date(Date.now() + 86400000),
      sameSite: "lax",
    });

    res.json({ token, adminId: admin._id, username: admin.username });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.checkAuth = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(400).json({ message: "Token is required!!" });
  }
  if (jwt.verify(token, process.env.JWT_SECRET)) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
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
    const deletedPost = await Media.findById(postId);
    console.log(deletedPost);
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

//Save a feed
exports.saveFeed = async (req, res) => {
  try {
    const { pageId, visioFeedId } = req.params;

    const visioFeed = await Media.findById(visioFeedId);

    if (!visioFeed) {
      return res
        .status(404)
        .json({ message: "Feed not availabe", success: false });
    }

    // Check if the saveId is already in savedPosts
    const isSaved = await VisioFeedSave.findOne({
      pageId,
      savedVisioFeeds: { $in: [visioFeedId] },
    });

    if (!isSaved) {
      // If not saved, push the saveId into savedPosts array
      const updatedData = await VisioFeedSave.findOneAndUpdate(
        { pageId },
        { $push: { savedVisioFeeds: visioFeedId } },
        { new: true, upsert: true } // 'upsert' creates a new document if none exists
      );
      if (updatedData) {
        return res
          .status(200)
          .json({ message: "Feed saved successfully", success: true });
      } else {
        return res
          .status(400)
          .json({ message: "Feed saved fail", success: false });
      }
    } else {
      const deletedData = await VisioFeedSave.findOneAndUpdate(
        { pageId },
        { $pull: { savedVisioFeeds: visioFeedId } },
        { new: true } // 'new: true' returns the modified document
      );
      if (deletedData) {
        return res
          .status(200)
          .json({ message: "Saved Feed Deleted successfully", success: true });
      } else {
        return res
          .status(400)
          .json({ message: "Feed deleted fail", success: false });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Get all saved feeds for a page
exports.getAllSavedFeeds = async (req, res) => {
  try {
    const { pageId } = req.params;

    if (!pageId) {
      return res.status(400).json({ message: "Page ID is required" });
    }

    const savedFeeds = await VisioFeedSave.findOne({ pageId })
      .populate("savedVisioFeeds")
      .populate("pageId");

    if (!savedFeeds || !savedFeeds.savedVisioFeeds.length) {
      return res.status(404).json({ message: "No saved feeds found" });
    }

    res.status(200).json(savedFeeds);
  } catch (error) {
    console.error("Error fetching saved feeds:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
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

//get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate("pages").populate("dvCard");
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
    const page = await Pages.findById(id).populate("dvCard").populate("userId");
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

exports.deletePagePost = async (req, res) => {
  const { id } = req.params;

  try {
    const pagePost = await Post.findById(id);
    if (!pagePost) {
      return res.status(404).json({ message: "Page Post not found" });
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: "Page Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting page post:", err.message);
    res.status(500).json({ message: "Internal Server Error", err });
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

//Report User
exports.reportUser = async (req, res) => {
  // const reportedBy = req.user?.userId;
  const reportedBy = "682c46a00e5bd673a55e0ad0";
  const { reportedUser, reason } = req.body;

  if (!reportedBy || !reportedUser || !reason) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingReport = await ReportUser.findOne({
      userId: reportedUser,
      reportedBy: reportedBy,
    });

    if (existingReport) {
      return res.status(400).json({ message: "User already reported" });
    }

    const newReport = new ReportUser({
      userId: reportedUser,
      reportedBy,
      reason,
    });

    await newReport.save();

    res.status(201).json({
      message: "User reported successfully",
      report: newReport,
    });
  } catch (err) {
    console.error("Error reporting user:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get all reported users
exports.getAllReportedUsers = async (req, res) => {
  try {
    const reportedUsers = await ReportUser.find().populate("userId reportedBy");
    res.status(200).json(reportedUsers);
  } catch (err) {
    console.error("Error fetching reported users:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get particular Reported User
exports.getReportedUser = async (req, res) => {
  const { id } = req.params;

  try {
    const reportedUser = await ReportUser.findById(id).populate(
      "userId reportedBy resolvedBy"
    );
    if (!reportedUser) {
      return res.status(404).json({ message: "Reported user not found" });
    }
    res.status(200).json(reportedUser);
  } catch (err) {
    console.error("Error fetching reported user:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Resolve reported User
exports.resolveReportUser = async (req, res) => {
  const { reportId } = req.params;
  const { actionTaken, resolverComments } = req.body;
  const resolverId = req.admin;

  if (!["warning", "suspended"].includes(actionTaken)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  const report = await ReportUser.findById(reportId);
  if (!report) return res.status(404).json({ message: "Report not found" });
  if (report.resolved)
    return res.status(400).json({ message: "Already resolved" });

  report.resolved = true;
  report.actionTaken = actionTaken;
  report.resolvedBy = resolverId;
  report.resolvedAt = new Date();
  report.resolverComments = resolverComments;

  await report.save();

  if (actionTaken === "warning") {
    const populatedReport = await ReportUser.findById(report._id).populate(
      "userId reportedBy resolvedBy"
    );

    return res.status(201).json({
      message: "Report Resolved Warning sent!!",
      report: populatedReport,
    });
  }

  if (actionTaken === "suspended") {
    await User.findByIdAndUpdate(
      report.userId,
      {
        suspendedUntil: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        isSuspended: true,
      },
      { new: true }
    );
  }

  // Re-populate to get updated user data
  const updatedPopulatedReport = await ReportUser.findById(report._id).populate(
    [
      { path: "userId" },
      { path: "reportedBy" },
      { path: "resolvedBy", select: "-password" },
    ]
  );

  return res
    .status(200)
    .json({ message: "Report Resolved", report: updatedPopulatedReport });
};

//Reject reported user
exports.rejectReportUser = async (req, res) => {
  const { reportId } = req.params;
  const { actionTaken, resolverComments } = req.body;
  const resolverId = req.admin;
  try {
    if (actionTaken !== "none") {
      return res.status(400).json({ message: "Invalid Action" });
    }
    const report = await ReportUser.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found!" });
    }
    if (report.resolved) {
      return res.status(400).json({ message: "Report already resolved" });
    }
    report.resolved = true;
    report.actionTaken = actionTaken;
    report.resolvedBy = resolverId;
    report.resolvedAt = new Date();
    report.resolverComments = resolverComments;

    await report.save();
    const newReport = await ReportUser.findById(reportId).populate([
      { path: "userId" },
      { path: "reportedBy" },
      { path: "resolvedBy", select: "-password" },
    ]);
    res
      .status(200)
      .json({ message: "Report rejected successfully!!", newReport });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

//Delete Reported User
exports.deleteReportUser = async (req, res) => {
  const { reportId } = req.params;
  const report = await ReportUser.findByIdAndDelete(reportId);
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }
  res.status(200).json({ message: "Report deleted successfully!" });
};

//Report Pages

exports.reportPages = async (req, res) => {
  const { pageId } = req.params;
  // const userId = req.user?.id || req.user;
  const userId = "682c46a00e5bd673a55e0ad0";
  const { reason, details } = req.body;

  try {
    if (!pageId || !userId || !reason || !details) {
      return res.status(406).json({ message: "All fields are required!!" });
    }
    const page = await Pages.findById(pageId);
    if (!page) {
      return res.status(404).json({ message: "Page not found!" });
    }

    const existingReport = await PageReport.findOne({
      pageId,
      reportedBy: userId,
    });

    if (existingReport) {
      return res.status(400).json({ message: "Report already exists!" });
    }

    const newPageReport = await PageReport.create({
      pageId,
      reportedBy: userId,
      reason,
      details,
    });
    if (!newPageReport) {
      return res.status(401).json({ message: "Report not created" });
    }
    res
      .status(201)
      .json({ message: "Report Created Successfully!", newPageReport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllReportedPages = async (req, res) => {
  try {
    const reportedPages = await PageReport.find({})
      .populate("pageId")
      .populate("reportedBy")
      .lean();
    if (!reportedPages) {
      return res.status(404).json({ message: "No Page Reported" });
    }
    res.status(200).json(reportedPages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" }, err);
  }
};

exports.getParticularReportedPage = async (req, res) => {
  const { pageId } = req.params;
  try {
    const page = await PageReport.findById(pageId)
      .populate("pageId")
      .populate("reportedBy")
      .populate({ path: "resolvedBy", select: "-password" })
      .lean();
    if (!page) {
      return res.status(404).json({ message: "Reported Page Not Found!" });
    }
    res.status(200).json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" }, err);
  }
};

exports.resolvePageReport = async (req, res) => {
  const { reportId } = req.params;
  const { actionTaken, resolverComments } = req.body;
  const resolverId = req.admin;

  const VALID_ACTIONS = ["warning", "suspended"];
  const SUSPENSION_DURATION_DAYS = 7;

  try {
    if (!VALID_ACTIONS.includes(actionTaken)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const report = await PageReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report Not Found!!" });
    }

    if (report.resolved) {
      return res
        .status(400)
        .json({ message: "Page Report already resolved!!" });
    }

    // Mark the report as resolved
    report.resolved = true;
    report.actionTaken = actionTaken;
    report.resolvedBy = resolverId;
    report.resolvedAt = Date.now();
    report.resolverComments = resolverComments;
    await report.save();

    // Handle the action
    switch (actionTaken) {
      case "warning":
        console.log("Message sent to page!!");
        break;

      case "suspended":
        await Pages.findByIdAndUpdate(
          report.pageId,
          {
            isSuspended: true,
            suspendedUntil:
              Date.now() + SUSPENSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
          },
          { new: true }
        );
        break;
      default:
        return res.status(400).json({ message: "Invalid Action Taken!!" });
    }

    // Populate and send the final updated report
    await report.populate([
      { path: "pageId" },
      { path: "reportedBy" },
      { path: "resolvedBy", select: "-password" },
    ]);
    return res.status(200).json({
      message:
        actionTaken === "warning"
          ? "Warning sent to user via email"
          : "Page Report Resolved!!",
      report,
    });
  } catch (err) {
    console.error("Error resolving page report:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.rejectPageReport = async (req, res) => {
  const { reportId } = req.params;
  const { actionTaken, resolverComments } = req.body;
  const resolverId = req.admin;
  try {
    if (actionTaken !== "none") {
      return res.status(400).json({ message: "Invalid Action" });
    }
    const report = await PageReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found!" });
    }
    if (report.resolved) {
      return res.status(400).json({ message: "Report already resolved" });
    }
    report.resolved = true;
    report.actionTaken = actionTaken;
    report.resolvedBy = resolverId;
    report.resolvedAt = new Date();
    report.resolverComments = resolverComments;

    await report.save();
    const newReport = await PageReport.findById(reportId).populate([
      { path: "pageId" },
      { path: "reportedBy" },
      { path: "resolvedBy", select: "-password" },
    ]);
    res
      .status(200)
      .json({ message: "Report rejected successfully!!", newReport });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

exports.deletePageReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    if (!reportId) {
      return res.status(400).json({ message: "Report Id is required" });
    }
    const report = await PageReport.findByIdAndDelete(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found!!" });
    }
    return res.status(200).json({ message: "Report Deleted Successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

//User Verification Requests

exports.createVerificationRequest = async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  // const userId = "6833443cd4871639f8570bc1";

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const existingRequest = await UserVerification.findOne({
      user: userId,
      status: "pending",
    });
    if (existingRequest) {
      return res
        .status(401)
        .json({ message: "A pending verification request already exists." });
    }

    const authorizedSelfieFile = req.files["authorizedSelfie"]?.[0]?.path;
    const identityDocumentFile = req.files["identityDocument"]?.[0]?.path;

    if (!authorizedSelfieFile || !identityDocumentFile) {
      return res
        .status(400)
        .json({ message: "Both selfie and ID document are required." });
    }

    const newRequest = new UserVerification({
      user: userId,
      authorizedSelfie: authorizedSelfieFile,
      identityDocument: identityDocumentFile,
    });

    await newRequest.save();

    res.status(201).json({
      message: "Verification request created successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating verification request:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllUserVerificationRequests = async (req, res) => {
  try {
    const verificationRequests = await UserVerification.find().populate("user");
    if (!verificationRequests || verificationRequests.length === 0) {
      return res
        .status(404)
        .json({ message: "No user verification requests found" });
    }
    res.status(200).json(verificationRequests);
  } catch (err) {
    console.error("Error fetching user verification requests:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getSpecificVerificationRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const verificationRequest = await UserVerification.findById(id)
      .populate("user")
      .populate("reviewedBy");
    if (!verificationRequest) {
      return res
        .status(404)
        .json({ message: "Verification request not found" });
    }
    res.status(200).json(verificationRequest);
  } catch (error) {
    console.error("Error fetching verification request:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.acceptUserVerificationRequest = async (req, res) => {
  const { userRequestId } = req.params;
  const { userId } = req.body;
  const adminId = req.admin;

  try {
    const verificationRequest = await UserVerification.findById(
      userRequestId
    ).populate("user");

    if (!verificationRequest) {
      return res
        .status(404)
        .json({ message: "Verification request not found" });
    }

    if (verificationRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Verification request has already been processed!" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user and verification request
    user.isVerified = true;

    verificationRequest.status = "approved";
    verificationRequest.reviewedAt = new Date();
    verificationRequest.reviewedBy = adminId;
    verificationRequest.identityDocument = null; // Clear identity document if approved

    await Promise.all([user.save(), verificationRequest.save()]);

    res.status(200).json({
      message: "User verification request accepted successfully",
      request: verificationRequest,
    });
  } catch (error) {
    console.error("Error accepting verification request:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.rejectUserVerificationRequest = async (req, res) => {
  const { id } = req.params;
  const { rejectReason } = req.body;
  try {
    const verificationRequest = await UserVerification.findById(id).populate(
      "user"
    );
    if (!verificationRequest) {
      return res
        .status(404)
        .json({ message: "Verification request not found" });
    }

    verificationRequest.rejectionReason = rejectReason || "No reason provided";

    if (verificationRequest.status === "approved") {
      return res.status(403).json({ message: "User is already verified" });
    }

    // Update the request status to 'denied'
    verificationRequest.status = "rejected";
    await verificationRequest.save();

    // Optionally, you can perform additional actions like notifying the user

    res.status(200).json({
      message: "User verification request denied successfully",
      request: verificationRequest,
    });
  } catch (error) {
    console.error("Error denying verification request:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteUserVerificationRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const verificationRequest = await UserVerification.findByIdAndDelete(
      requestId
    );
    if (!verificationRequest) {
      return res
        .status(404)
        .json({ message: "Verification request not found" });
    }
    res.status(200).json({
      message: "User verification request deleted successfully",
      request: verificationRequest,
    });
  } catch (error) {
    console.error("Error deleting verification request:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Business Verification Requests

exports.createBusinessVerificationRequest = async (req, res) => {
  // const userId = req.user?._id || req.user?.id;
  const userId = "6833443cd4871639f8570bc1";
  const { pageId } = req.params;
  const { phone, email, adminFullName, roleType, link1, link2, link3 } =
    req.body;

  if (!userId || !pageId) {
    return res.status(400).json({ message: "User ID and Page ID is required" });
  }

  try {
    const existingRequest = await BusinessVerification.findOne({
      user: userId,
      page: pageId,
      status: "pending",
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A pending verification request already exists." });
    }

    const authorizedSelfieFile = req.files["authorizedSelfie"]?.[0]?.path;
    const businessPhotoFile = req.files["businessPhoto"]?.[0]?.path;
    const businessDocFile = req.files["businessDoc"]?.[0]?.path;

    if (!authorizedSelfieFile || !businessPhotoFile || !businessDocFile) {
      return res.status(400).json({ message: "All Fields are required!!" });
    }

    const newRequest = new BusinessVerification({
      user: userId,
      page: pageId,
      authorizedSelfie: authorizedSelfieFile,
      businessPhoto: businessPhotoFile,
      businessDoc: businessDocFile,
      phone,
      email,
      adminFullName,
      roleType,
      link1,
      link2,
      link3,
    });

    await newRequest.save();

    res.status(201).json({
      message: "Business verification request created successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error(
      "Error creating business verification request:",
      error.message
    );
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllBusinessVerificationRequests = async (req, res) => {
  try {
    const verificationRequests = await BusinessVerification.find()
      .populate("user")
      .populate("page")
      .populate({ path: "reviewedBy", select: "-password" });
    if (!verificationRequests || verificationRequests.length === 0) {
      return res
        .status(404)
        .json({ message: "No business verification requests found" });
    }
    res.status(200).json(verificationRequests);
  } catch (err) {
    console.error(
      "Error fetching business verification requests:",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getSpecificBusinessVerificationRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const verificationRequest = await BusinessVerification.findById(requestId)
      .populate("user")
      .populate("page");

    if (!verificationRequest) {
      return res.status(404).json({
        message: "Business verification request not found",
      });
    }

    res.status(200).json(verificationRequest);
  } catch (error) {
    console.error(
      "Error fetching specific business verification request:",
      error.message
    );
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.acceptBusinessVerificationRequest = async (req, res) => {
  const adminId = req.admin;
  const { pageId } = req.body;
  const { requestId } = req.params;

  try {
    const verificationRequest = await BusinessVerification.findById(requestId);
    if (!verificationRequest) {
      return res.status(404).json({
        message: "Business verification request not found",
      });
    }

    if (verificationRequest.status !== "pending") {
      return res.status(400).json({
        message: "Verification request has already been processed!",
      });
    }

    const updatedRequest = await BusinessVerification.findByIdAndUpdate(
      requestId,
      {
        reviewedBy: adminId,
        status: "approved",
        reviewedAt: new Date(),
      },
      { new: true }
    );

    const updatedPage = await Pages.findByIdAndUpdate(
      pageId,
      { isVerified: true },
      { new: true }
    );

    if (!updatedPage) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.status(200).json({
      message: "Business verification request approved successfully",
      request: updatedRequest,
    });
  } catch (err) {
    console.error(
      "Error accepting business verification request:",
      err.message
    );
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.rejectBusinessVerificationRequest = async (req, res) => {
  const { requestId } = req.params;
  const { rejectReason } = req.body;

  try {
    const verificationRequest = await BusinessVerification.findById(requestId);
    if (!verificationRequest) {
      return res.status(404).json({
        message: "Business verification request not found",
      });
    }

    if (verificationRequest.status === "approved") {
      return res.status(401).json({ message: "Request already approved" });
    }

    verificationRequest.rejectionReason = rejectReason || "No reason provided";
    verificationRequest.status = "rejected";

    await verificationRequest.save();

    res.status(200).json({
      message: "Business verification request rejected successfully",
      request: verificationRequest,
    });
  } catch (error) {
    console.error("Error rejecting business verification request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteBusinessVerificationRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const verificationRequest = await BusinessVerification.findByIdAndDelete(
      requestId
    );
    if (!verificationRequest) {
      return res.status(404).json({
        message: "Business verification request not found",
      });
    }
    res.status(200).json({
      message: "Business verification request deleted successfully",
      request: verificationRequest,
    });
  } catch (error) {
    console.error("Error deleting business verification request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Creator Verificaion Requests
exports.createCreatorVerificationRequest = async (req, res) => {
  // const userId = req.user?._id || req.user?.id;
  const userId = "682abe896017e836dd119a35";
  const pageId = req.params.pageId;
  const { phone, email, link1, link2, link3 } = req.body;

  if (!userId || !pageId) {
    return res
      .status(400)
      .json({ message: "Both userId and PageId is required" });
  }

  try {
    const existingRequest = await CreatorVerification.findOne({
      user: userId,
      page: pageId,
      status: "pending",
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A pending verification request already exists." });
    }

    const authorizedSelfieFile = req.files["authorizedSelfie"]?.[0]?.path;
    const professionalDocFile = req.files["professionalDoc"]?.[0]?.path;

    if (!authorizedSelfieFile || !professionalDocFile) {
      return res
        .status(400)
        .json({ message: "Both selfie and ID document are required." });
    }

    const newRequest = new CreatorVerification({
      user: userId,
      page: pageId,
      authorizedSelfie: authorizedSelfieFile,
      professionalDoc: professionalDocFile,
      phone,
      email,
      link1,
      link2,
      link3,
    });

    await newRequest.save();

    res.status(201).json({
      message: "Creator verification request created successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error(
      "Error creating creator verification request:",
      error.message
    );
    res.status(500).json({ message: "Internal Server Error" });
  }
};
