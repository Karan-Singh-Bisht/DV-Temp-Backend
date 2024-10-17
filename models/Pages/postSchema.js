const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    pageId: {
      type: mongoose.Types.ObjectId,
      ref: "Pages",
      required: true,
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
    },
    media:[
      {
         path:{
          type:String,
         },
         public_id:{
          type:String,
         }
      }
    ],
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
      // required: [true, 'isBlog field is required'],
    },
  },
  { timestamps: true }
);

module.exports = model("Post", postSchema);
