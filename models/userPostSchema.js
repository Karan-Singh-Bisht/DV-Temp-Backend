const mongoose = require("mongoose");

const userPostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
  title: {
    type: String,
    //required: true,
  },
  description: {
    type: String,
  },
  media: {
    type: [String],
    default: [],
  },
  coverPhoto: {
    type: String,
  },
  video: {
    type: String,
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
  },
}, { timestamps: true });

module.exports = mongoose.model("userPost", userPostSchema);
