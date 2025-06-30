const User = require("../models/User");

const getUsersWithinARadius = async (radiusInKm, userId) => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.location) {
      console.log("User not found or location missing");
      return;
    }

    const [lng, lat] = user.location.coordinates;

    const nearbyUsers = await User.find({
      _id: { $ne: user._id },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radiusInKm * 1000, // convert km to meters
        },
      },
    });

    return nearbyUsers;
  } catch (err) {
    console.error("Error in getUsersWithinARadius:", err);
  }
};

module.exports = { getUsersWithinARadius };
