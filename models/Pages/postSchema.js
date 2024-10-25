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
    media: [mediaSchema],
    coverPhoto: {
      type: mediaSchema,
    },
    video: {
      type: mediaSchema,
    },
    location: {
      type: String,
    },
    mediatype: {
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
    isArchive:{
      type:Boolean,
      default:false
    },
    pinned:{
      type:Boolean,
      default:false
    },
    pinnedAt: {
      type: Date
    },
    
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
      // required: [true, 'isBlog field is required'],
    },
  },
  { timestamps: true }
);

module.exports = model("Post", postSchema);
