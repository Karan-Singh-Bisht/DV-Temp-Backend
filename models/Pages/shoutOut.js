const mongoose = require("mongoose");

const shoutOutSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "Casual Meeting",
      "Party & Hangouts",
      "Adventure",
      "Travel Buddy",
      "Fitness & Wellness",
      "Foodie",
      "Movie & Chill",
      "Events",
      "Gaming",
      "Sports",
    ],
    required: true,
  },
  subCategory: { type: String },
  event: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  dateOfTheEvent: {
    type: Date,
    required: true,
  },
  timeOfTheEvent: {
    type: String,
    required: true,
  },
  maxMembers: {
    type: Number,
    required: true,
    default: 1,
  },
  radius: { type: Number, default: 1000 }, // in meters
  acceptedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  rejectedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});

// Geo index for location
shoutOutSchema.index({ location: "2dsphere" });

// 🕒 TTL index on expiresAt
shoutOutSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ShoutOut = mongoose.model("ShoutOut", shoutOutSchema);

module.exports = ShoutOut;
