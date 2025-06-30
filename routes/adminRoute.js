const express = require("express");
const {
  login,
  createPost,
  updatePost,
  deletePost,
  getAllFeeds,
  getFeedById,
  uploadUserAvatar,
  uploadPageAvatar,
  getAllUsers,
  getUserDetails,
  getAllPages,
  getPageDetails,
  deleteUser,
  deletePage,
  getAllPagePosts,
  getPagePost,
  getInfoCards,
  getInfoCard,
  deleteVisionFeed,
  getAllReportedUsers,
  getAllUserVerificationRequests,
  createVerificationRequest,
  getSpecificVerificationRequest,
  acceptUserVerificationRequest,
  rejectUserVerificationRequest,
  deleteUserVerificationRequest,
  deletePagePost,
  reportUser,
  getReportedUser,
  createBusinessVerificationRequest,
  getAllBusinessVerificationRequests,
  acceptBusinessVerificationRequest,
  rejectBusinessVerificationRequest,
  deleteBusinessVerificationRequest,
  getSpecificBusinessVerificationRequest,
  saveFeed,
  getAllSavedFeeds,
  createCreatorVerificationRequest,
  reportPages,
  getAllReportedPages,
  getParticularReportedPage,
  deleteReportUser,
  deletePageReport,
  resolveReportUser,
  rejectReportUser,
  resolvePageReport,
  rejectPageReport,
} = require("../controllers/adminController/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  uploadAvatarMulter,
  uploadVerficationDetailsMulter,
  uploadBusinessVerificationDetailsMulter,
  uploadCreatorVerificationDetailsMulter,
} = require("../middlewares/multer");
const userAuthMiddleware = require("../middlewares/userAuthMiddleware");

const router = express.Router();

router.post("/login", login);
// router.post('/login',authMiddleware, login);

// Vision feed routes
router.post("/feed", authMiddleware, createPost);
router.put("/feed/:id", authMiddleware, updatePost);
router.delete("/feed/:id", authMiddleware, deletePost);
router.get("/feeds", authMiddleware, getAllFeeds);
router.get("/feed/:id", authMiddleware, getFeedById);
router.delete("/feed/:id", authMiddleware, deleteVisionFeed);
router.post("/feed/saveFeed/:pageId/:visioFeedId", saveFeed);
router.get("/feed/saveFeeds/:pageId", getAllSavedFeeds);
router.post("/avatar/upload-avataruser", uploadAvatarMulter, uploadUserAvatar);
router.post("/avatar/upload-avatarpage", uploadAvatarMulter, uploadPageAvatar);

router.get("/get-all-users", authMiddleware, getAllUsers);
router.get("/get-user-details/:id", authMiddleware, getUserDetails);
router.delete("/delete-user/:id", authMiddleware, deleteUser);
router.get("/get-all-pages", authMiddleware, getAllPages);
router.get("/get-page-details/:id", authMiddleware, getPageDetails);
router.delete("/delete-page/:id", authMiddleware, deletePage);

//Page Post routes
router.get("/get-all-page-posts", authMiddleware, getAllPagePosts);
router.get("/get-page-post/:id", authMiddleware, getPagePost);
router.delete("/delete-page-post/:id", authMiddleware, deletePagePost);

//InfoCards routes
router.get("/get-all-infoCards", authMiddleware, getInfoCards);
router.get("/get-info-card/:id", authMiddleware, getInfoCard);

//Reported Users
router.post(
  "/report-user",
  // userAuthMiddleware,
  reportUser
);

router.get("/get-all-reported-users", authMiddleware, getAllReportedUsers);

router.get("/get-reported-user/:id", authMiddleware, getReportedUser);

router.patch(
  "/resolve-reported-user/:reportId",
  authMiddleware,
  resolveReportUser
);

router.patch(
  "/reject-reported-user/:reportId",
  authMiddleware,
  rejectReportUser
);

router.delete(
  "/delete-user-report/:reportId",
  authMiddleware,
  deleteReportUser
);

//Reported Pages

router.post(
  "/report-page/:pageId",
  // userAuthMiddleware,
  reportPages
);

router.get("/get-all-report-page", authMiddleware, getAllReportedPages);

router.get(
  "/get-reported-page/:pageId",
  authMiddleware,
  getParticularReportedPage
);

router.patch(
  "/resolve-page-report/:reportId",
  authMiddleware,
  resolvePageReport
);

router.patch("/reject-page-report/:reportId", authMiddleware, rejectPageReport);

router.delete(
  "/delete-page-report/:reportId",
  authMiddleware,
  deletePageReport
);

//User Verification
router.get(
  "/get-all-user-verification-requests",
  authMiddleware,
  getAllUserVerificationRequests
);

router.post(
  "/user-verification-request",
  // userAuthMiddleware,
  uploadVerficationDetailsMulter.fields([
    { name: "authorizedSelfie", maxCount: 1 }, // 1 selfie
    { name: "identityDocument", maxCount: 1 }, // 1 identity document
  ]),
  createVerificationRequest
);

router.get(
  "/user-verification-request/:id",
  authMiddleware,
  getSpecificVerificationRequest
);

router.put(
  "/approve-user-verification-request/:userRequestId",
  authMiddleware,
  acceptUserVerificationRequest
);

router.put(
  "/reject-user-verification-request/:id",
  authMiddleware,
  rejectUserVerificationRequest
);

router.delete(
  "/delete-user-verification-request/:requestId",
  authMiddleware,
  deleteUserVerificationRequest
);

//Business Verification

router.post(
  "/business-verification-request/:pageId",
  // userAuthMiddleware,
  uploadBusinessVerificationDetailsMulter.fields([
    { name: "authorizedSelfie", maxCount: 1 }, // 1 selfie
    { name: "businessPhoto", maxCount: 1 }, // 1 business photo
    { name: "businessDoc", maxCount: 1 }, // 1 business document
  ]),
  createBusinessVerificationRequest
);

router.get(
  "/get-all-business-verification-requests",
  authMiddleware,
  getAllBusinessVerificationRequests
);

router.get(
  "/business-verification-request/:requestId",
  authMiddleware,
  getSpecificBusinessVerificationRequest
);

router.put(
  "/approve-business-verification-request/:requestId",
  authMiddleware,
  acceptBusinessVerificationRequest
);

router.put(
  "/reject-business-verification-request/:requestId",
  authMiddleware,
  rejectBusinessVerificationRequest
);

router.delete(
  "/delete-business-verification-request/:requestId",
  authMiddleware,
  deleteBusinessVerificationRequest
);

//Creator Verification

router.post(
  "/creator-verification-request/:pageId",
  // userAuthMiddleware,
  uploadCreatorVerificationDetailsMulter.fields([
    { name: "authorizedSelfie", maxCount: 1 },
    { name: "professionalDoc", maxCount: 1 },
  ]),
  createCreatorVerificationRequest
);

module.exports = router;
