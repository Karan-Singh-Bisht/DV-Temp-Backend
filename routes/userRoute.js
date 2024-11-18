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
} = require('../controllers/userController');
const reportController= require('../controllers/reportController')

const { sendFriendRequest, acceptFriendRequest, declineFriendRequest, checkFriendshipStatus, listFriends,unfriendUser, getIncomingFriendRequests, handleFriendRequestOrUnfriend,updateUserBlockEntry } = require('../controllers/friendshipController');
const PagesController= require('../controllers/Pages/PagesController')
const PageActionsController= require('../controllers/Pages/PageActionsController')

const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

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



//account creation 
router.get('/users/getallpages/:userPageId/:pageId',userAuthMiddleware,PagesController.getAllpages)
router.post('/users/addnewpage',userAuthMiddleware, PagesController.addNewPage)
router.patch ('/users/updatepage',userAuthMiddleware, PagesController.updatePage)
router.get ('/users/togglepagestatus/:pageId',userAuthMiddleware, PagesController.togglePageStatus)
router.get('/users/searchpages/:search/:pageId',userAuthMiddleware, PagesController.searchPages)
router.get ('/users/getpage/:userPageId/:pageId',userAuthMiddleware, PagesController.getPage)
router.get ('/users/getpageself/:pageId',userAuthMiddleware, PagesController.getPageSelf)


//Page 

//page blocking
router.get('/users/blocktoggle/:pageId/:blockpageId', userAuthMiddleware,PageActionsController.updatePageBlockEntry)

// page following
// router.get('/users/followpage/:pageId/:followingId',userAuthMiddleware,PageActionsController.addToFollowing)
router.get('/users/getallfollower/:pageId',userAuthMiddleware,PageActionsController.getAllFollowers)
router.get('/users/getallfollowing/:pageId',userAuthMiddleware,PageActionsController.getAllFollowing)
router.get('/users/followpageaction/:pageId/:followId',userAuthMiddleware,PageActionsController.followActions)




// report post
router.post('/users/reportuserpost',userAuthMiddleware,reportController.reportPost)



module.exports = router;
