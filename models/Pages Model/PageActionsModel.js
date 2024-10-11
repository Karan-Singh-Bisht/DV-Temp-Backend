const mongoose = require("mongoose");

const PageActionsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  blockedList: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Pages", 
    },
  ],
  followingList: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Pages", 
    },
  ],
  followersList: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Pages", 
    },
  ],
});

// Create a model from the schema
const PageActions = mongoose.model("PageActions", PageActionsSchema);

module.exports = PageActions;
