const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const mediaSchema = new Schema({
  path: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
  },
});

const postSchema = new Schema(
  {
    pageId: {
      type: mongoose.Types.ObjectId,
      ref: "Pages",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    media: [mediaSchema], // Array of media objects with path and public_id
    coverPhoto: {
      type: mediaSchema, // Single cover photo object with path and public_id
    },
    video: {
      type: mediaSchema, // Single video object with path and public_id
    },
    location: {
      type: String,
    },
    category: {
      type: [String],
      default: [],
    },
    subCategory: {
      type: [String],
      default: [],
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    shared: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    isBlocked: {
      type: Boolean,
      default: false,
    },
    sensitive: {
      type: Boolean,
      default: false,
    },
    isBlog: {
      type: Boolean,
      // Uncomment if you want to enforce it as a required field
      // required: [true, 'isBlog field is required'],
    },
  },
  { timestamps: true }
);

module.exports = model("Post", postSchema);
