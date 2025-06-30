const User = require("../../models/User");
const Pages = require("../../models/Pages/PagesModel");
const PageActions = require("../../models/Pages/PageActionsModel");
const ReportPagePost = require("../../models/Pages/PageRepost");
const ReportPage = require("../../models/Pages/reportPageSchema");
const PageAvatar = require("../../models/Pages/pageAvatarSchema");
const CustomPageAvatar = require("../../models/Pages/pageCustomAvatarSchema");
const dvCards = require("../../models/Pages/dvCardsModel");
const ShoutOut = require("../../models/Pages/shoutOut");

// const getAllpages = async (req, res) => {
//   try {
//     const allPages = await Pages.find();
//     const pageId = req.params.pageId;
//     const blockedData = await PageActions.findOne({ pageId });
//     let filteredPages = allPages;
//     if (blockedData) {
//       filteredPages = allPages.filter((page) => {
//         return !blockedData.blockedList.includes(page._id.toString());
//       });
//       console.log(filteredPages);
//       return res
//         .status(200)
//         .json({ success: true, data: filteredPages, message: "ok done" });
//     }
//   } catch (error) {
//     console.error(error.message);
//   }
// };

const mongoose = require("mongoose"); // Make sure to import mongoose
const postSchema = require("../../models/Pages/postSchema");
const { getUsersWithinARadius } = require("../../utils/getUsersWithinARadius");
const { sendNotificationToNearbyUsers } = require("../../server/socketServer");

const getAllpages = async (req, res) => {
  try {
    const allPages = await Pages.find().populate(
      "pages",
      "pageName date_of_birth gender userName profileImg"
    );
    const pageId = req.params.pageId;
    const userPageId = req.params.userPageId;

    // Validate if pageId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(pageId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid pageId" });
    }

    const PageActionData = await PageActions.findOne({ pageId: userPageId });

    let filteredPages = allPages;

    if (PageActionData) {
      filteredPages = allPages.filter((page) => {
        return !PageActionData.blockedList.includes(pageId.toString());
      });
    }

    // Map the filtered pages to include relationship status for each page
    const pagesWithRelationshipStatus = filteredPages.map((page) => {
      let relationshipStatus = "none"; // Default status

      // Check if the page _id is in followingList or followersList
      if (PageActionData) {
        if (PageActionData.followingList.includes(page._id.toString())) {
          relationshipStatus = "following";
        }
        if (PageActionData.followersList.includes(page._id.toString())) {
          relationshipStatus = "follower";
        }
      }

      return {
        ...page.toObject(), // Convert Mongoose document to plain object
        friendshipStatus: relationshipStatus, // Add the relationshipStatus to each page
      };
    });

    return res.status(200).json({
      success: true,
      data: pagesWithRelationshipStatus,
      message: "ok done",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const addNewPage = async (req, res) => {
  try {
    const {
      pageName,
      userName,
      Category,
      Phone,
      email,
      Bio,
      Website,
      isCreator,
      profileImg,
      date_of_birth,
      gender,
      profileBackground,
    } = req.body;

    const userId = req.user._id;
    let PageData = {
      userId,
      pageName,
      userName,
      Category,
      Phone,
      email,
      Bio,
      Website,
      isCreator,
      profileImg,
      date_of_birth,
      gender,
      profileBackground,
    };

    const newPage = new Pages(PageData);
    const savePageData = await newPage.save();
    if (savePageData) {
      let PageAction = new PageActions({
        pageId: savePageData._id,
      });
      const savedPagesAction = await PageAction.save();

      if (savedPagesAction) {
        return res.status(201).json({
          success: true,
          message: "Page created successfully",
          data: savePageData,
        });
      } else {
        return res.status(404).json({ message: "Page created Fail" });
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server errror",
      error: error.message,
    });
  }
};

const updatePage = async (req, res) => {
  try {
    const allowedFields = [
      "pageName",
      "userName",
      "Category",
      "Phone",
      "email",
      "Bio",
      "Website",
      "isCreator",
      "profileBackground",
      "profileImg",
      "date_of_birth",
      "gender",
      "coPartner",
      "isPrivate",
    ];

    // Check for required fields
    if (!req.body.pageId) {
      return res.status(400).json({ message: "Page ID is required" });
    }

    if (!req.user?._id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const avatarFile = req.files?.avatar?.[0];
    let profileAvatar = null;

    // Process avatar file if present
    if (avatarFile) {
      if (!avatarFile.path || !avatarFile.filename) {
        return res.status(400).json({ message: "Invalid avatar file" });
      }
      profileAvatar = {
        path: avatarFile.path,
        public_id: avatarFile.filename,
      };
    }

    // Filter fields from req.body
    const updateData = allowedFields.reduce((acc, field) => {
      if (req.body[field] !== undefined) {
        acc[field] = req.body[field];
      }
      return acc;
    }, {});

    // Add profileAvatar if exists
    if (profileAvatar) {
      updateData.profileAvatar = profileAvatar;
    }

    // Check if updateData is empty
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Update the page
    const updatedPage = await Pages.findOneAndUpdate(
      { _id: req.body.pageId, userId: req.user._id },
      updateData,
      {
        new: true, // Return the updated document
      }
    );

    if (!updatedPage) {
      return res.status(404).json({ message: "Page not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Page updated successfully",
      data: updatedPage,
    });
  } catch (error) {
    console.error("Error updating page:", error);
    return res.status(500).json({ message: "Error updating page", error });
  }
};

const togglePageStatus = async (req, res) => {
  try {
    const pageId = req.params.pageId;

    const page = await Pages.findOne({ _id: pageId, userId: req.user._id });
    if (page) {
      const isUpdatedPage = await Pages.findByIdAndUpdate(
        pageId,
        { isActive: !page.isActive },
        { new: true }
      );
      if (isUpdatedPage) {
        let boo = isUpdatedPage.isActive ? "Activation" : "Deactivation";
        res
          .status(200)
          .json({ success: true, message: `the Page ${boo} is successfully` });
      }
    } else {
      res.status(404).json({ success: false, message: "Page not Found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const searchPages = async (req, res) => {
  try {
    const { search, pageId } = req.params;

    // Find pages matching the search query
    const pages = await Pages.find({
      pageName: { $regex: new RegExp(search, "i") },
    });

    if (!pages.length) {
      return res.status(404).json({
        success: false,
        message: "No pages found for the given search query.",
      });
    }

    // Convert `pageId` to ObjectId
    const pageIdObject = new mongoose.Types.ObjectId(pageId);

    // Fetch the PageActions and reported data
    const [pageActionData, reportedData] = await Promise.all([
      PageActions.findOne({ pageId }),
      ReportPage.aggregate([
        { $match: { reportedBy: pageIdObject } },
        {
          $group: {
            _id: null,
            pageIds: { $push: "$pageId" },
          },
        },
        { $project: { _id: 0, pageIds: 1 } },
      ]),
    ]);
    // Extract reported page IDs
    const reportedPageIds =
      reportedData.length > 0 ? reportedData[0].pageIds : [];

    // Filter out reported pages

    let filteredPages = pages.filter(
      (page) =>
        !reportedPageIds.some(
          (reportedId) => reportedId.toString() === page._id.toString()
        )
    );

    // Filter out blocked pages if `pageActionData` exists
    if (pageActionData) {
      const { blockedList } = pageActionData;
      filteredPages = filteredPages.filter(
        (page) => !blockedList.includes(page._id.toString())
      );
    }

    // Add friendship status to filtered pages
    const pagesWithRelationshipStatus = filteredPages.map((page) => {
      let friendshipStatus = "none";

      if (pageActionData) {
        const { followingList, followersList } = pageActionData;

        if (followingList.includes(page._id.toString())) {
          friendshipStatus = "following";
        } else if (followersList.includes(page._id.toString())) {
          friendshipStatus = "follower";
        }
      }

      return { ...page.toObject(), friendshipStatus };
    });

    // Send response with filtered pages and their relationship statuses
    return res.status(200).json({
      success: true,
      data: pagesWithRelationshipStatus,
    });
  } catch (error) {
    console.error("Error in searchPages:", error); // Log for debugging
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the request.",
    });
  }
};

const getPage = async (req, res) => {
  try {
    const { pageId, userPageId } = req.params;

    const page = await Pages.findById(pageId);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    const pageActionData = await PageActions.findOne({ pageId: userPageId });

    let relationshipStatus = "none"; // Default status

    // Check if the page _id is in followingList or followersList
    if (pageActionData) {
      if (pageActionData.followingList.includes(page._id.toString())) {
        relationshipStatus = "following";
      }
      if (pageActionData.followersList.includes(page._id.toString())) {
        relationshipStatus = "follower";
      }
    }

    return res.status(200).json({
      success: true,
      message: "Page data fetched successfully",
      data: {
        ...page.toObject(), // Spread the page object
        friendshipStatus: relationshipStatus, // Add the relationshipStatus
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPageSelf = async (req, res) => {
  try {
    const { pageId } = req.params;

    const page = await Pages.findById(pageId);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Page data fetched successfully",
      data: page,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const reportpagePost = async (req, res) => {
  try {
    const { reason, postId, pageId, details } = req.body;

    // Verify if the post exists

    const isPost = await postSchema.findById(postId);
    if (!isPost) {
      return res.status(404).json({ message: " No post found" });
    }

    // Create a new report
    const addReport = new ReportPagePost({
      reason,
      postId,
      details,
      reportedBy: pageId,
    });

    // Save the report to the database
    const savedReport = await addReport.save();

    if (!savedReport) {
      return res.status(400).json({ message: "Failed to submit report" });
    }

    // Block the user if the report is saved successfully
    if (savedReport) {
      return res.status(200).json({ message: "Report submitted successfully" });
    }
  } catch (error) {
    console.error("Error in reporting post:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const reportpage = async (req, res) => {
  try {
    const { reason, reporterId, pageId, details } = req.body;
    console.log(req.body);

    const isPage = await Pages.findById(pageId);
    if (!isPage) {
      return res.status(404).json({ message: " No page found" });
    }

    // Create a new report
    const addReport = new ReportPage({
      reason,
      pageId,
      details,
      reportedBy: reporterId,
    });

    // Save the report to the database
    const savedReport = await addReport.save();

    if (!savedReport) {
      return res.status(400).json({ message: "Failed to submit report" });
    }

    // Block the user if the report is saved successfully
    if (savedReport) {
      return res.status(200).json({ message: "Report submitted successfully" });
    }
  } catch (error) {
    console.error("Error in reporting post:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllAvatar = async (req, res) => {
  try {
    const { pageId } = req.params;

    // Fetch the `isCreator` field for the given page ID
    const page = await Pages.findById(pageId, { isCreator: true });
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Initialize avatars array
    let avatars = [];
    const allavatars = await PageAvatar.find();

    // If the page is not a creator, include custom avatars
    if (!page.isCreator) {
      const customAvatars = await CustomPageAvatar.find({ pageId });
      avatars = [...customAvatars, ...allavatars];
    } else {
      avatars = allavatars;
    }

    res
      .status(200)
      .json({ message: "All avatar fetched successfully", data: avatars });
  } catch (error) {
    console.error("Error fetching avatars:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching avatars" });
  }
};

const addCustomAvatar = async (req, res) => {
  try {
    const { pageId, category } = req.body;

    console.log(pageId, category);

    // Fetch the `isCreator` field for the given page ID
    const page = await Pages.findOne({ _id: pageId, isCreator: false });
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    const avatarFile = req.files["avatar"]?.[0];
    if (!avatarFile) {
      return res.status(400).json({ message: "Avatar is required" });
    }

    const avatarUrl = {
      path: avatarFile.path,
      public_id: avatarFile.filename,
    };

    // Create a new UserAvatar instance
    const newAvatar = new CustomPageAvatar({
      pageId,
      category,
      avatarName: avatarUrl,
    });

    // Save the avatar to the database
    await newAvatar.save();

    res.status(200).json({
      message: "Avatar uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res
      .status(500)
      .json({ message: "An error occurred while uploading avatar" });
  }
};

//Page admin managing
// ✅ Add admin (super admin only)
const addAdminToPage = async (req, res) => {
  const { pageId, userIdToAdd, role } = req.body;
  const requesterId = req.user._id;

  try {
    const page = await Pages.findById(pageId);
    if (!page) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    const isSuperAdmin = page.superAdmins.includes(requesterId.toString());
    if (!isSuperAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Only super admins can add admins" });
    }

    if (role === "super") {
      if (!page.superAdmins.includes(userIdToAdd)) {
        page.superAdmins.push(userIdToAdd);
      }
    } else if (role === "co") {
      if (!page.coAdmins.includes(userIdToAdd)) {
        page.coAdmins.push(userIdToAdd);
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role type" });
    }

    await page.save();
    return res.status(200).json({
      success: true,
      message: "Admin added successfully",
      page,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ✅ Remove admin (super admin only)
const removeAdminFromPage = async (req, res) => {
  const { pageId, userIdToRemove, role } = req.body;
  const requesterId = req.user._id;

  try {
    const page = await Pages.findById(pageId);
    if (!page) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    const isSuperAdmin = page.superAdmins.includes(requesterId.toString());
    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only super admins can remove admins",
      });
    }

    if (role === "super") {
      page.superAdmins = page.superAdmins.filter(
        (id) => id.toString() !== userIdToRemove
      );
      if (page.superAdmins.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Page must have at least one super admin",
        });
      }
    } else if (role === "co") {
      page.coAdmins = page.coAdmins.filter(
        (id) => id.toString() !== userIdToRemove
      );
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role type" });
    }

    await page.save();
    return res.status(200).json({
      success: true,
      message: "Admin removed successfully",
      page,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ✅ Co-admin leaves the page
const leaveAsCoAdmin = async (req, res) => {
  const { pageId } = req.body;
  const userId = req.user._id;

  try {
    const page = await Pages.findById(pageId);
    if (!page) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    page.coAdmins = page.coAdmins.filter(
      (id) => id.toString() !== userId.toString()
    );
    await page.save();

    return res.status(200).json({
      success: true,
      message: "You have left as co-admin",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ✅ Super admin leaves the page (only if another super admin exists)
const leaveAsSuperAdmin = async (req, res) => {
  const { pageId } = req.body;
  const userId = req.user._id;

  try {
    const page = await Pages.findById(pageId);
    if (!page) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    if (!page.superAdmins.includes(userId.toString())) {
      return res.status(403).json({
        success: false,
        message: "You are not a super admin",
      });
    }

    if (page.superAdmins.length <= 1) {
      return res.status(400).json({
        success: false,
        message: "Page must have at least one super admin",
      });
    }

    page.superAdmins = page.superAdmins.filter(
      (id) => id.toString() !== userId.toString()
    );
    await page.save();

    return res.status(200).json({
      success: true,
      message: "You have left as super admin",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ✅ Get all admins of a page (super + co)
const getAllAdminsOfPage = async (req, res) => {
  const { pageId } = req.body; // or use req.params.pageId if route is dynamic like /pages/:pageId/admins

  try {
    const page = await Pages.findById(pageId)
      .populate("superAdmins", "name username profileImg") // Only select needed fields
      .populate("coAdmins", "name username profileImg");

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      superAdmins: page.superAdmins,
      coAdmins: page.coAdmins,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const createDVCard = async (req, res) => {
  const { pageId } = req.params;
  const {
    fullName,
    designation,
    companyName,
    phone,
    email,
    location,
    website,
    category,
    note,
    latitude,
    longitude,
    date,
    qrCodeURL,
  } = req.body;
  try {
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const cardFrontImageFile = req.files["cardFrontImage"]?.[0]?.path;
    const cardBackImageFile = req.files["cardBackImage"]?.[0]?.path;
    const selfieFile = req.files["selfie"]?.[0]?.path;

    const geolocation = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)], // [longitude, latitude]
    };

    // Create new DV card
    const newDVCard = await dvCards.create({
      page: pageId,
      cardFrontImage: cardFrontImageFile || null,
      cardBackImage: cardBackImageFile || null,
      selfie: selfieFile || null,
      fullName,
      designation,
      companyName,
      phone,
      email,
      location,
      website,
      qrCodeURL,
      category,
      note,
      date: date ? new Date(date) : undefined,
      geolocation,
    });

    if (!newDVCard) {
      return res.status(400).json({
        success: false,
        message: "Failed to create DV card",
      });
    }

    // Update the page with the DV card ID
    await Pages.findByIdAndUpdate(
      pageId,
      { dvCard: newDVCard._id },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "DV card created successfully",
      data: newDVCard,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const createShoutOutCard = async (req, res) => {
  const creatorId = req?.userId || req?.user?.id;
  // const creatorId = "682abe896017e836dd119a35";
  const {
    message,
    category,
    subCategory,
    event,
    lng,
    lat,
    date,
    time,
    maxMembers,
    radiusInKm,
  } = req.body;

  if (!time || !/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(time)) {
    return res.status(400).json({ message: "Invalid time format" });
  }

  const [start, end] = time.split("-");
  const expiryDate = new Date(`${date}T${end}:00`);

  try {
    if (!creatorId) {
      return res.status(403).json({ message: "Unauthorized! Pls Login" });
    }

    const radiusInMetres = radiusInKm * 1000;

    const newShoutOutCard = await ShoutOut.create({
      creator: creatorId,
      message,
      category,
      subCategory,
      event,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      dateOfTheEvent: new Date(date),
      timeOfTheEvent: time,
      maxMembers,
      radius: radiusInMetres,
      expiresAt: expiryDate,
    });

    if (!newShoutOutCard) {
      return res.status(404).json({ message: "Shout Out Card not created!!" });
    }

    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    user.shoutOutCard = newShoutOutCard._id;
    await user.save();

    const nearByUsers = await getUsersWithinARadius(radiusInKm, creatorId);

    res
      .status(201)
      .json({ message: "card Created successfully!", newShoutOutCard });

    nearByUsers.forEach((user) => {
      sendNotificationToNearbyUsers(user._id, newShoutOutCard);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", err });
  }
};

const acceptShoutOutCard = async (req, res) => {
  const userId = req.user?.id || req.user;
  const { cardId } = req.params;

  if (!userId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const shoutOutCard = await ShoutOut.findById(cardId);
    if (!shoutOutCard) {
      return res.status(404).json({ message: "ShoutOut card not found" });
    }

    if (shoutOutCard.acceptedUsers.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You have already accepted this shoutout" });
    }

    if (shoutOutCard.acceptedUsers.length >= shoutOutCard.maxMembers) {
      return res.status(400).json({ message: "Maximum members reached" });
    }

    shoutOutCard.acceptedUsers.push(userId);
    await shoutOutCard.save();

    res.status(201).json({ message: "Request Accepted!" });
  } catch (err) {
    console.error("❌ Error accepting shoutout:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

const rejectShoutOutCard = async (req, res) => {
  const userId = req.user?.id || req.user;
  const { cardId } = req.params;

  if (!userId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const shoutOutCard = await ShoutOut.findById(cardId);
    if (!shoutOutCard) {
      return res.status(404).json({ message: "ShoutOut card not found" });
    }

    if (shoutOutCard.acceptedUsers.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You already accepted this shoutout" });
    }

    if (shoutOutCard.rejectedUsers.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You already rejected this shoutout" });
    }

    shoutOutCard.rejectedUsers.push(userId);
    await shoutOutCard.save();

    return res.status(200).json({ message: "You rejected the shoutout" });
  } catch (err) {
    console.error("❌ Error rejecting shoutout:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

module.exports = {
  getAllpages,
  addNewPage,
  updatePage,
  togglePageStatus,
  searchPages,
  getPage,
  getPageSelf,
  reportpagePost,
  reportpage,
  getAllAvatar,
  addCustomAvatar,
  addAdminToPage,
  removeAdminFromPage,
  leaveAsCoAdmin,
  leaveAsSuperAdmin,
  getAllAdminsOfPage,
  createDVCard,
  createShoutOutCard,
  acceptShoutOutCard,
  rejectShoutOutCard,
};
