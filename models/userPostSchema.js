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
  media: [{
      path: {
          type: String,
          required: true,
      },
      public_id: {
          type: String,
          required: true,
      }
  }],
  coverPhoto: {
      path: { type: String },
      public_id: { type: String },
  },
  video: {
      path: { type: String },
      public_id: { type: String },
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
  pinned: {
    type: Boolean,
    default: false,
},
pinnedAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("userPost", userPostSchema);
