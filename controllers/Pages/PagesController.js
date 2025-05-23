const User = require("../../models/User");
const Pages = require("../../models/Pages/PagesModel");
const PageActions = require("../../models/Pages/PageActionsModel");
const ReportPagePost = require("../../models/Pages/PageRepost");
const ReportPage = require("../../models/Pages/reportPageSchema");
const PageAvatar = require('../../models/Pages/pageAvatarSchema');
const CustomPageAvatar = require('../../models/Pages/pageCustomAvatarSchema');


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
      console.log(isUpdatedPage);
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
    const reportedPageIds = reportedData.length > 0 ? reportedData[0].pageIds : [];
    
    // Filter out reported pages
    
    let filteredPages = pages.filter(
      (page) => !reportedPageIds.some((reportedId) => reportedId.toString()===page._id.toString())
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
    let avatars=[]
    const allavatars = await PageAvatar.find();

    // If the page is not a creator, include custom avatars
    if (!page.isCreator) {
      const customAvatars = await CustomPageAvatar.find({ pageId });
      avatars = [...customAvatars,...allavatars]
    }else{
      avatars= allavatars
    }

    res.status(200).json({message:"All avatar fetched successfully",data:avatars});
  } catch (error) {
    console.error("Error fetching avatars:", error);
    res.status(500).json({ message: "An error occurred while fetching avatars" });
  }
};

const addCustomAvatar = async (req, res) => {
  try {
    const { pageId, category } = req.body;

console.log(pageId, category);

    // Fetch the `isCreator` field for the given page ID
    const page = await Pages.findOne({_id:pageId,  isCreator: false });
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
    res.status(500).json({ message: "An error occurred while uploading avatar" });
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
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    const isSuperAdmin = page.superAdmins.includes(requesterId.toString());
    if (!isSuperAdmin) {
      return res.status(403).json({ success: false, message: "Only super admins can add admins" });
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
      return res.status(400).json({ success: false, message: "Invalid role type" });
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
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    const isSuperAdmin = page.superAdmins.includes(requesterId.toString());
    if (!isSuperAdmin) {
      return res.status(403).json({ success: false, message: "Only super admins can remove admins" });
    }

    if (role === "super") {
      page.superAdmins = page.superAdmins.filter(id => id.toString() !== userIdToRemove);
      if (page.superAdmins.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Page must have at least one super admin",
        });
      }
    } else if (role === "co") {
      page.coAdmins = page.coAdmins.filter(id => id.toString() !== userIdToRemove);
    } else {
      return res.status(400).json({ success: false, message: "Invalid role type" });
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
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    page.coAdmins = page.coAdmins.filter(id => id.toString() !== userId.toString());
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
      return res.status(404).json({ success: false, message: "Page not found" });
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

    page.superAdmins = page.superAdmins.filter(id => id.toString() !== userId.toString());
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
  getAllAdminsOfPage
};
