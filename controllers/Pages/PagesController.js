const User = require("../../models/User");
const Pages = require("../../models/Pages/PagesModel");
const PageActions = require("../../models/Pages/PageActionsModel");
const ReportPagePost = require("../../models/Pages/repostPagepostSchema");
const ReportPage = require("../../models/Pages/repostPageSchema");

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
      "pageName userName profileImg"
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
      profileBackground,
    } = req.body;

    const userId = req.user._id;
    const PageData = {
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
      "coPartner",
      "isPrivate",
    ];

    // Filter only the fields that are present in req.body
    const updateData = allowedFields.reduce((acc, field) => {
      if (req.body[field] !== undefined) {
        acc[field] = req.body[field];
      }
      return acc;
    }, {});
    const updatedPage = await Pages.findOneAndUpdate(
      { _id: req.body.pageId, userId: req.user._id },
      updateData,
      {
        new: true, // Return the updated document
      }
    );
    console.log(updatedPage);
    if (!updatedPage) {
      return res.status(404).json({ message: "Page  not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Page Updated successfully",
      data: updatedPage,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error updating user", error });
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

    const pages = await Pages.find({
      pageName: { $regex: new RegExp(search, "i") },
    });

    if (pages.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pages not found" });
    }
    console.log(req.user._id);
    const pageActionData = await PageActions.findOne({ pageId: pageId });
    let filteredPages = pages;
    console.log(pageActionData);
    if (pageActionData) {
      // Filter out blocked pages
      filteredPages = pages.filter(
        (page) => !pageActionData.blockedList.includes(page._id.toString())
      );
    }

    // Map each page to include friendship status
    const pagesWithRelationshipStatus = filteredPages.map((page) => {
      let friendshipStatus = "none";
      if (pageActionData) {
        if (pageActionData.followingList.includes(page._id.toString())) {
          friendshipStatus = "following";
        } else if (pageActionData.followersList.includes(page._id.toString())) {
          friendshipStatus = "follower";
        }
      }
      return { ...page.toObject(), friendshipStatus };
    });

    return res
      .status(200)
      .json({ success: true, data: pagesWithRelationshipStatus });
  } catch (error) {
    console.error("Error in searchPages:", error); // Log the error for debugging
    return res.status(500).json({ success: false, message: "Server error" });
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

module.exports = {
  getAllpages,
  addNewPage,
  updatePage,
  togglePageStatus,
  searchPages,
  getPage,
  getPageSelf,
  reportpagePost,
  reportpage
};
