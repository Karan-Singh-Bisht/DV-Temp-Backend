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

const { sendFriendRequest, acceptFriendRequest, declineFriendRequest, checkFriendshipStatus, listFriends,unfriendUser, getIncomingFriendRequests, handleFriendRequestOrUnfriend } = require('../controllers/friendshipController');
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

//use if any need
router.post('/users/friend/request/:recipientId', userAuthMiddleware, sendFriendRequest);
router.post('/users/friends/unfriend/:userId', userAuthMiddleware, unfriendUser);

//accept n decline req
router.post('/users/friend/request/accept/:userId', userAuthMiddleware, acceptFriendRequest);
router.post('/users/friend/request/decline/:userId', userAuthMiddleware, declineFriendRequest);


// Additional routes remain the same
router.get('/users/friend/status/:userId', userAuthMiddleware, checkFriendshipStatus);
router.post('/users/friends', userAuthMiddleware, listFriends);
router.get('/users/friend-requests/incoming', userAuthMiddleware, getIncomingFriendRequests);




//account creation 
router.get('/users/getallpages/:pageId',userAuthMiddleware,PagesController.getAllpages)
router.post('/users/addnewpage',userAuthMiddleware, PagesController.addNewPage)
router.patch ('/users/updatepage',userAuthMiddleware, PagesController.updatePage)
router.get ('/users/togglepagestatus/:pageId',userAuthMiddleware, PagesController.togglePageStatus)
router.get('/users/searchpages/:search',userAuthMiddleware, PagesController.searchPages)
router.get ('/users/getpage/:pageId',userAuthMiddleware, PagesController.getPage)


//Page Action

//page blocking
router.get('/users/blockpage/:pageId/:blockpageId', userAuthMiddleware,PageActionsController.updateUserBlockEntry)

// page following
// router.get('/users/followpage/:pageId/:followingId',userAuthMiddleware,PageActionsController.addToFollowing)
router.get('/users/getallfollower/:pageId',userAuthMiddleware,PageActionsController.getAllFollowers)
router.get('/users/getallfollowing/:pageId',userAuthMiddleware,PageActionsController.getAllFollowing)
router.get('/users/followpageaction/:pageId/:followId',userAuthMiddleware,PageActionsController.followActions)


module.exports = router;
