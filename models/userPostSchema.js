const mongoose = require("mongoose");

const userPostSchema = new mongoose.Schema(
  {
    user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    invitation: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    media: [
      {
        path: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    coverPhoto: {
      path: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    video: {
      path: {
        type: String,
      },
      public_id: {
        type: String,
      },
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    shared: [
      {
        type: mongoose.Schema.Types.ObjectId,
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
    mediatype: {
      type: String,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    pinnedAt: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isCollaborated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserPost", userPostSchema);
