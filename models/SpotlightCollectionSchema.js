const mongoose = require("mongoose");

const SpotlightCollectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    collectionImg: {
      path: { type: String, required: true },
      public_id: { type: String },
      // public_id: { type: String, required: true },
    },
    stories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserStory",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SpotlightCollection", SpotlightCollectionSchema);
