const mongoose = require("mongoose");

const PagesSchema = new mongoose.Schema(
  {
    pageName: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pages",
    },
    userName: {
      type: String,
      required: true,
    },
    Category: {
      type: String,
      required: true,
    },
    Phone: {
      type: Number,
    },
    email: {
      type: String,
      required: true,
    },
    Bio: {
      type: String,
    },
    profileBackground: {
      type: String,
      required: true,
    },
    Website: {
      type: String,
    },
    isCreator: {
      type: Boolean,
      requried: true,
    },
    profileImg: {
      type: String,
      requried: true,
    },
    date_of_birth: {
      type: String,
      requried: true,
    },
    gender: {
      type: String,
      requried: true,
    },
    profileAvatar: {
      path:{
        type:String
      },
      public_id:{
        type:String
      }
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },

    profileBackground: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Pages = mongoose.model("Pages", PagesSchema);
module.exports = Pages;
