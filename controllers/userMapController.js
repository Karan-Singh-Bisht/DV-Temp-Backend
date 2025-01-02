const UserMap = require('../models/userMap');
const { default: mongoose } = require('mongoose');

const placeCategories = require('../utils/mapCategories');






const updateCurrentLocation = async (req, res) => {
  try {
    const { latitude, longitude, isSharing } = req.body;
    const userId = req.user.id;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const userMap = await UserMap.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          'currentLocation.latitude': latitude,
          'currentLocation.longitude': longitude,
          'currentLocation.lastUpdated': new Date(),
          'currentLocation.isSharing': isSharing !== undefined ? isSharing : true
        }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      currentLocation: {
        latitude: userMap.currentLocation.latitude,
        longitude: userMap.currentLocation.longitude,
        lastUpdated: userMap.currentLocation.lastUpdated,
        isSharing: userMap.currentLocation.isSharing
      }
    });

  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};





const getMyLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const userMap = await UserMap.findOne({ user: userId });

    if (!userMap || !userMap.currentLocation) {
      return res.status(404).json({
        success: false,
        message: "User location not found"
      });
    }

    res.status(200).json({
      success: true,
      currentLocation: {
        latitude: userMap.currentLocation.latitude,
        longitude: userMap.currentLocation.longitude,
        lastUpdated: userMap.currentLocation.lastUpdated,
        isSharing: userMap.currentLocation.isSharing
      }
    });

  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};





const getFriendLocation = async (req, res) => {
  try {
    const { friendId } = req.params;
    const requestingUserId = req.user.id; 

    const userMap = await UserMap.findOne({ user: friendId })
      .populate('user', '_id name username profileImg');

    if (!userMap || !userMap.currentLocation) {
      return res.status(404).json({
        success: false,
        message: "User location not found"
      });
    }

   
    if (userMap.visibility === 'none') {
      return res.status(403).json({
        success: false,
        message: "This user's location is not shared"
      });
    }

    if (userMap.visibility === 'selected_buddies' && 
        (!userMap.selectedBuddies || !userMap.selectedBuddies.includes(requestingUserId))) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this user's location"
      });
    }

    if (userMap.visibility === 'excluded_buddies' && 
        userMap.excludedBuddies && userMap.excludedBuddies.includes(requestingUserId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this user's location"
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: userMap.user._id,
        name: userMap.user.name,
        username: userMap.user.username,
        profileImg: userMap.user.profileImg
      },
      currentLocation: {
        latitude: userMap.currentLocation.latitude,
        longitude: userMap.currentLocation.longitude,
        lastUpdated: userMap.currentLocation.lastUpdated,
        isSharing: userMap.currentLocation.isSharing
      }
    });

  } catch (error) {
    console.error('Error fetching friend location:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching friend's location"
    });
  }
};




const toggleSaveLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { locationId } = req.params;
    const { latitude, longitude, name, description, locationType, friendId } = req.body;

 
    if (!latitude || !longitude || !name || !locationType) {
      return res.status(422).json({
        success: false,
        message: "Invalid location data",
        errors: [
          { field: "name", message: "Name is required" },
          { field: "latitude", message: "Latitude is required" },
          { field: "longitude", message: "Longitude is required" },
          { field: "locationType", message: "Location type is required" }
        ]
      });
    }

    if (!["friend", "favorite", "custom"].includes(locationType)) {
      return res.status(422).json({
        success: false,
        message: "Invalid location type"
      });
    }

    if (locationType === "friend" && !friendId) {
      return res.status(422).json({
        success: false,
        message: "Friend ID is required for friend location type"
      });
    }

    let userMap = await UserMap.findOne({ user: userId });
    if (!userMap) {
      userMap = new UserMap({ user: userId });
    }

    const existingLocations = userMap.locations.filter(loc => 
      loc.latitude === latitude && 
      loc.longitude === longitude && 
      loc.name === name
    );

    if (existingLocations.length > 0) {
      const keepLocation = existingLocations[0];
      
      userMap.locations = userMap.locations.filter(loc => 
        !(loc.latitude === latitude && 
          loc.longitude === longitude && 
          loc.name === name) ||
        loc._id.toString() === keepLocation._id.toString()
      );


      keepLocation.isSaved = !keepLocation.isSaved;
      keepLocation.description = description; 
      keepLocation.locationType = locationType; 
      if (locationType === "friend") {
        keepLocation.friendId = friendId;
      }

      await userMap.save();

      return res.status(200).json({
        success: true,
        location: keepLocation,
        message: keepLocation.isSaved ? 
          "Location saved successfully" : 
          "Location unsaved successfully"
      });
    } else {
     
      const newLocation = {
        latitude,
        longitude,
        name,
        description,
        locationType,
        friendId,
        isSaved: true
      };
      
      userMap.locations.push(newLocation);
      await userMap.save();

      return res.status(200).json({
        success: true,
        location: userMap.locations[userMap.locations.length - 1],
        message: "Location saved successfully"
      });
    }

  } catch (error) {
    console.error('Error toggling location save:', error);
    res.status(500).json({
      success: false,
      message: "Error processing location save/unsave"
    });
  }
};








const getSavedLocations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, isSaved } = req.query;

    const userMap = await UserMap.findOne({ user: userId })
      .populate('locations.friendId', '_id name username profileImg');

    if (!userMap || !userMap.locations.length) {
      return res.status(404).json({
        success: false,
        message: "No saved locations found"
      });
    }

    let locations = userMap.locations;

    
    if (type) {
      locations = locations.filter(loc => loc.locationType === type);
    }

 
    if (isSaved !== undefined) {
      const isLocationSaved = isSaved === 'true';
      locations = locations.filter(loc => loc.isSaved === isLocationSaved);
    }

    res.status(200).json({
      success: true,
      locations
    });

  } catch (error) {
    console.error('Error fetching saved locations:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching saved locations"
    });
  }
};








const updateVisibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const { visibility, selectedBuddies, excludedBuddies } = req.body;


    if (!["everyone", "selected_buddies", "excluded_buddies", "none"].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visibility setting"
      });
    }

    if (visibility === "selected_buddies" && (!selectedBuddies || !selectedBuddies.length)) {
      return res.status(422).json({
        success: false,
        message: "Selected buddies are required when visibility is set to selected_buddies"
      });
    }

    if (visibility === "excluded_buddies" && (!excludedBuddies || !excludedBuddies.length)) {
      return res.status(422).json({
        success: false,
        message: "Excluded buddies are required when visibility is set to excluded_buddies"
      });
    }

    const userMap = await UserMap.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          visibility,
          selectedBuddies: visibility === "selected_buddies" ? selectedBuddies : [],
          excludedBuddies: visibility === "excluded_buddies" ? excludedBuddies : []
        }
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      visibility: userMap.visibility,
      ...(visibility === "selected_buddies" && { selectedBuddies: userMap.selectedBuddies }),
      ...(visibility === "excluded_buddies" && { excludedBuddies: userMap.excludedBuddies })
    });

  } catch (error) {
    console.error('Error updating visibility settings:', error);
    res.status(500).json({
      success: false,
      message: "Error updating visibility settings"
    });
  }
};









const getNearbyFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const userMap = await UserMap.findOne({ user: userId });

    if (!userMap || !userMap.currentLocation) {
      return res.status(422).json({
        success: false,
        message: "Your location is not set"
      });
    }

    const radiusInKm = 1000;
    const radiusInRadians = radiusInKm / 6371;

    const nearbyFriends = await UserMap.find({
      user: { $ne: userId },
      'currentLocation.isSharing': true,
      $or: [
        { visibility: 'everyone' },
        { visibility: 'selected_buddies', selectedBuddies: userId },
        { 
          visibility: 'excluded_buddies',
          excludedBuddies: { $ne: userId }
        }
      ],
      'currentLocation.latitude': {
        $gte: userMap.currentLocation.latitude - (radiusInRadians * 180 / Math.PI),
        $lte: userMap.currentLocation.latitude + (radiusInRadians * 180 / Math.PI)
      },
      'currentLocation.longitude': {
        $gte: userMap.currentLocation.longitude - (radiusInRadians * 180 / Math.PI) / Math.cos(userMap.currentLocation.latitude * Math.PI / 180),
        $lte: userMap.currentLocation.longitude + (radiusInRadians * 180 / Math.PI) / Math.cos(userMap.currentLocation.latitude * Math.PI / 180)
      }
    }).populate({
      path: 'user',
      select: '_id name username profileImg'
    });

    const validFriends = nearbyFriends.filter(friend => 
      friend && friend.user && friend.user._id && friend.currentLocation
    );

    const nearbyFriendsWithDistance = validFriends
      .map(friend => {
        try {
          const distance = Math.round(calculateDistance(
            userMap.currentLocation.latitude,
            userMap.currentLocation.longitude,
            friend.currentLocation.latitude,
            friend.currentLocation.longitude
          ) * 10) / 10;

          return {
            userId: friend.user._id,
            name: friend.user.name || 'Unknown',
            username: friend.user.username || 'Unknown',
            profileImg: friend.user.profileImg || '',
            latitude: friend.currentLocation.latitude,
            longitude: friend.currentLocation.longitude,
            distance
          };
        } catch (error) {
          return null;
        }
      })
      .filter(friend => friend !== null && friend.distance <= radiusInKm)
      .sort((a, b) => a.distance - b.distance);

    return res.status(200).json({
      success: true,
      nearby: nearbyFriendsWithDistance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching nearby friends"
    });
  }
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};










const getPlaceCategories = async (req, res) => {
  try {
      const categories = Object.keys(placeCategories).map(key => ({
          id: key,
          name: key.replace('_', ' ').toUpperCase(),
          icon: placeCategories[key].icon
      }));

      res.json({
          success: true,
          data: categories
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Error fetching categories'
      });
  }
};


const getPlacesByCategory = async (req, res) => {
  try {
      const userId = req.user.id;
      const { category } = req.params;

      if (!placeCategories[category]) {
          return res.status(400).json({
              success: false,
              message: 'Invalid category'
          });
      }

      const userMap = await UserMap.findOne({ user: userId });
      if (!userMap?.currentLocation) {
          return res.status(400).json({
              success: false,
              message: 'Please update your location first'
          });
      }

      const lat = userMap.currentLocation.latitude;
      const lon = userMap.currentLocation.longitude;
      const offset = 0.045;

      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.search = new URLSearchParams({
          format: 'json',
          amenity: placeCategories[category].type,
          lat: lat,
          lon: lon,
          countrycodes: 'in',
          addressdetails: 1,
          bounded: 1,
          limit: 30,
          viewbox: `${lon - offset},${lat - offset},${lon + offset},${lat + offset}`,
          dedupe: 1,
          extratags: 1,
          namedetails: 1,
          'accept-language': 'en'
      });

      const response = await fetch(url, {
          headers: {
              'User-Agent': 'DeVi-Backend'
          }
      });
      
      if (!response.ok) {
          throw new Error('Failed to fetch places');
      }

      const data = await response.json();

      let places = data
          .filter(place => {
              const name = place.display_name.split(',')[0].toLowerCase();
              return name !== 'hospital' && 
                     name !== 'clinic' && 
                     name.length > 3;
          })
          .map(place => {
              const addressParts = [
                  place.address?.road,
                  place.address?.suburb,
                  place.address?.city
              ].filter(Boolean);

              const emergency = place.extratags?.emergency === 'yes' || 
                              place.extratags?.['healthcare:emergency'] === 'yes';
              const healthcare = place.extratags?.healthcare;
              
              const phone = place.extratags?.phone || 
                          place.extratags?.['contact:phone'] || 
                          place.extratags?.['phone:emergency'] ||
                          place.extratags?.['contact:mobile'] ||
                          place.address?.['phone'];

              const website = place.extratags?.website || 
                            place.extratags?.['contact:website'] || 
                            place.extratags?.['url'] ||
                            place.address?.['website'];

              const openingHours = place.extratags?.opening_hours || 
                                 place.extratags?.['opening_hours:covid19'] ||
                                 (emergency ? '24/7' : null);

              const is24x7 = emergency || 
                            openingHours === '24/7' || 
                            place.name.toLowerCase().includes('emergency') ||
                            (place.name.toLowerCase().includes('government') && healthcare === 'hospital');

              return {
                  id: place.place_id,
                  name: place.display_name.split(',')[0],
                  location: {
                      latitude: parseFloat(place.lat),
                      longitude: parseFloat(place.lon)
                  },
                  address: addressParts.join(', '),
                  distance: calculateDistance(
                      lat,
                      lon,
                      parseFloat(place.lat),
                      parseFloat(place.lon)
                  ),
                  icon: placeCategories[category].icon,
                  type: place.type,
                  openingHours,
                  emergency,
                  healthcare_type: healthcare,
                  specialization: place.extratags?.['healthcare:speciality'] || null,
                  facilities: {
                      ambulance: place.extratags?.['emergency:ambulance'] === 'yes',
                      icu: place.extratags?.['healthcare:icu'] === 'yes',
                      emergency_room: emergency,
                      wheelchair: place.extratags?.['wheelchair'] === 'yes'
                  },
                  contact: {
                      phone: phone || null,
                      website: website || null,
                      email: place.extratags?.['contact:email'] || null
                  },
                  is24x7,
                  rating: place.extratags?.['rating'] || null,
                  lastUpdated: place.extratags?.['last_updated'] || null
              };
          });

      places = places.filter((place, index, self) =>
          index === self.findIndex((p) => (
              p.name.toLowerCase() === place.name.toLowerCase() &&
              Math.abs(p.location.latitude - place.location.latitude) < 0.00005 &&
              Math.abs(p.location.longitude - place.location.longitude) < 0.00005
          ))
      );

      const nearbyPlaces = places
          .filter(place => place.distance <= 5)
          .sort((a, b) => a.distance - b.distance);

      res.json({
          success: true,
          data: {
              category: {
                  id: category,
                  name: category.replace('_', ' ').toUpperCase(),
                  icon: placeCategories[category].icon
              },
              places: nearbyPlaces,
              userLocation: {
                  latitude: lat,
                  longitude: lon
              },
              total: nearbyPlaces.length,
              timestamp: new Date().toISOString()
          }
      });

  } catch (error) {
      console.error('Error fetching places:', error);
      res.status(500).json({
          success: false,
          message: 'Error fetching places'
      });
  }
};






module.exports = {
  updateCurrentLocation,
  getMyLocation,
  getFriendLocation,
  toggleSaveLocation,
  getSavedLocations,
  updateVisibility,
  getNearbyFriends,
  getPlaceCategories,
  getPlacesByCategory
};