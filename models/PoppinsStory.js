// models/PoppinsStory.js
const mongoose = require("mongoose");

const PoppinsStorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    pageId: { type: mongoose.Schema.Types.ObjectId, ref: "Page", required: true },
    // images: [{ type: String, required: true }],
    image: {
      path: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    description: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    category: { type: String, required: true },
    // hidePageName: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PoppinsStorySchema.index({ location: "2dsphere" }); // Enable geospatial queries

module.exports = mongoose.model("PoppinsStory", PoppinsStorySchema);
