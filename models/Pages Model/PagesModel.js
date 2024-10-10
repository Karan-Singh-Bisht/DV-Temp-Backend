const mongoose = require("mongoose");

const PagesSchema = new mongoose.Schema(
  {
    pageName: {
      type: String,
      required: true,
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
      requried: true,
    },
    email: {
      type: String,
      required: true,
    },
    Bio: {
      type: String,
    },
    Website: {
      type: String,
    },
    isCreator: {
      type: Boolean,
      requried: true,
    },
    profileImg:{
        type:String,
        requried: true,
    },
    isActive:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

const Pages = mongoose.model("Pages", PagesSchema);
module.exports = Pages;
