const express = require('express');
const userMapController = require('../controllers/userMapController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');
const { uploadStoryMulter } = require("../middlewares/multer");

const multer = require("multer");

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();


router.post('/location/update', userAuthMiddleware, userMapController.updateCurrentLocation);

router.get('/location/me', userAuthMiddleware, userMapController.getMyLocation);

router.get('/location/friend/:friendId', userAuthMiddleware, userMapController.getFriendLocation);

router.post('/locations/:locationId/toggle-save', userAuthMiddleware, userMapController.toggleSaveLocation);

router.get('/locations', userAuthMiddleware, userMapController.getSavedLocations);

router.put('/visibility', userAuthMiddleware, userMapController.updateVisibility);

router.get('/nearby/friends', userAuthMiddleware, userMapController.getNearbyFriends);

router.get('/categories', userAuthMiddleware, userMapController.getPlaceCategories);

router.get('/places/:category', userAuthMiddleware, userMapController.getPlacesByCategory);

router.get('/nearby/places', userAuthMiddleware, userMapController.getAllNearbyPlaces);


//poppins
router.post("/poppins/createstory", userAuthMiddleware, uploadStoryMulter, userMapController.createStory);

router.get("/poppins/storiesbyloc", userAuthMiddleware, userMapController.getStoriesByLocation);

router.get("/poppins/locations", userAuthMiddleware, userMapController.getStoryLocations);


//infonics
router.post("/infonics/:pageId", userAuthMiddleware, userMapController.createInfonics);

router.get("/infonics", userAuthMiddleware, userMapController.getAllInfonics);

router.get("/infonics/nearby", userAuthMiddleware, userMapController.getNearbyInfonics);

router.get("/infonics/looking-for/:keyword", userAuthMiddleware, userMapController.getInfonicsByLookingFor);

router.get("/infonics/page/:pageId", userAuthMiddleware, userMapController.getInfonicsByPageId);

router.put("/infonics/:cardId", userAuthMiddleware, userMapController.updateInfonics);

router.delete("/infonics/:cardId", userAuthMiddleware, userMapController.deleteInfonics);



module.exports = router;