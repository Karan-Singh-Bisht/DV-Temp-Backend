const express = require('express');
const userMapController = require('../controllers/userMapController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

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


module.exports = router;