const mongoose = require("mongoose");

const userMapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  currentLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    lastUpdated: { type: Date, default: Date.now },
    isSharing: { type: Boolean, default: true },
  },

  locations: [
    {
      latitude: { type: Number },
      longitude: { type: Number },
      name: { type: String },
      description: { type: String },
      locationType: {
        type: String,
        enum: ["friend", "favorite", "custom"],
        required: true,
      },
      friendId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      isSaved: { type: Boolean, default: false },
      created_at: { type: Date, default: Date.now },
    },
  ],

  visibility: {
    type: String,
    enum: ["everyone", "selected_buddies", "excluded_buddies", "none"],
    default: "everyone",
  },

  selectedBuddies: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  excludedBuddies: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("UserMap", userMapSchema);
