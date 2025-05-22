const express = require('express');
const {
  loginUser,
  signupUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  //searchUsersByName,
  signoutUser,
  allavatars
} = require('../controllers/userController');

const musicController= require("../controllers/musicLirbrarycontroller")
const reportController= require('../controllers/reportController')
const {uploadAvatarMulter,uploadPostMedia}=require('../middlewares/multer')
const { sendFriendRequest, acceptFriendRequest, declineFriendRequest, checkFriendshipStatus, listFriends,unfriendUser, getIncomingFriendRequests, handleFriendRequestOrUnfriend,updateUserBlockEntry,accountBlockedList } = require('../controllers/friendshipController');
const PagesController= require('../controllers/Pages/PagesController')
const PageActionsController= require('../controllers/Pages/PageActionsController')

const userAuthMiddleware = require('../middlewares/userAuthMiddleware');
const notifcations = require('../controllers/NotificationUser');

const router = express.Router();

// User-related routes
router.post('/users/login', loginUser);      
router.post('/users/signup', signupUser);   
router.get('/users',userAuthMiddleware, getUsers);                     
//router.get('/users/search',userAuthMiddleware, searchUsersByName);  
router.get('/users/:id',userAuthMiddleware, getUserById);            
router.post('/users/signout', userAuthMiddleware, signoutUser);
router.patch('/users/update',userAuthMiddleware, updateUser);              
router.delete('/users/delete',userAuthMiddleware, deleteUser);



// Send friend request & unfriend
router.post('/users/friend/requests/:recipientId', userAuthMiddleware, handleFriendRequestOrUnfriend);


// //use if any need
// router.post('/users/friend/request/:recipientId', userAuthMiddleware, sendFriendRequest);
// router.post('/users/friends/unfriend/:userId', userAuthMiddleware, unfriendUser);

//accept n decline req
router.post('/users/friend/request/accept/:userId', userAuthMiddleware, acceptFriendRequest);
router.post('/users/friend/request/decline/:userId', userAuthMiddleware, declineFriendRequest);


// Additional routes remain the same
router.get('/users/friend/status/:userId', userAuthMiddleware, checkFriendshipStatus);
router.post('/users/friends', userAuthMiddleware, listFriends);
router.get('/users/friend-requests/incoming', userAuthMiddleware, getIncomingFriendRequests);
router.get('/users/accountblocktoggle/:blockpageId', userAuthMiddleware,updateUserBlockEntry)
router.post('/users/blockedlistuser', userAuthMiddleware,accountBlockedList)




//account creation 
router.get('/users/getallpages/:userPageId/:pageId',userAuthMiddleware,PagesController.getAllpages)
router.post('/users/addnewpage',userAuthMiddleware, PagesController.addNewPage)
router.patch ('/users/updatepage',userAuthMiddleware,uploadAvatarMulter, PagesController.updatePage)
router.get ('/users/togglepagestatus/:pageId',userAuthMiddleware, PagesController.togglePageStatus)
router.get('/users/searchpages/:search/:pageId',userAuthMiddleware, PagesController.searchPages)
router.get ('/users/getpage/:userPageId/:pageId',userAuthMiddleware, PagesController.getPage)
router.get ('/users/getpageself/:pageId',userAuthMiddleware, PagesController.getPageSelf)


//Page manage
router.post("/users/page/add-admin", userAuthMiddleware, PagesController.addAdminToPage);
router.post("/users/page/remove-admin", userAuthMiddleware, PagesController.removeAdminFromPage);
router.post("/users/page/leave-coadmin", userAuthMiddleware, PagesController.leaveAsCoAdmin);
router.post("/users/page/leave-superadmin", userAuthMiddleware, PagesController.leaveAsSuperAdmin);
router.post("/users/page/get-admins", userAuthMiddleware, PagesController.getAllAdminsOfPage);

//page blocking
router.get('/users/blocktoggle/:pageId/:blockpageId', userAuthMiddleware,PageActionsController.updatePageBlockEntry)
router.get('/users/blockedlist/:pageId/', userAuthMiddleware,PageActionsController.pageBlockedList)

// page following
// router.get('/users/followpage/:pageId/:followingId',userAuthMiddleware,PageActionsController.addToFollowing)
router.get('/users/getallfollower/:pageId',userAuthMiddleware,PageActionsController.getAllFollowers)
router.get('/users/getallfollowing/:pageId',userAuthMiddleware,PageActionsController.getAllFollowing)
router.get('/users/followpageaction/:pageId/:followId',userAuthMiddleware,PageActionsController.followActions)


// report post
router.post('/users/reportuserpost',userAuthMiddleware,reportController.reportPost)
// report user
router.post('/users/reportuser',userAuthMiddleware,reportController.reportUser)

router.post('/users/notifications',userAuthMiddleware,notifcations.getNotifications)
router.delete('/users/deletenotification/:userId/:id',userAuthMiddleware,notifcations.deleteNotification)
router.patch('/users/updatafriendnotification/:userId/:id',userAuthMiddleware,notifcations.updateFriendNotification)
router.post('/users/countnotification',userAuthMiddleware,notifcations.getUnreadMessageCount)
router.post('/users/allavatar',userAuthMiddleware,allavatars)


//add music 
router.post('/users/upload-music',userAuthMiddleware,uploadPostMedia,musicController.uploadMusicLibrary)
router.post('/users/getmusic',userAuthMiddleware,musicController.fetchAllMusic)

module.exports = router;
