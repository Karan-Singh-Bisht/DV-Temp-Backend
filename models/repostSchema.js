const mongoose = require("mongoose");

const repostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userPost",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Repost", repostSchema);