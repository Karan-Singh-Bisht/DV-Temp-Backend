// models/pageRepost.js

const mongoose = require("mongoose");

const pageRepostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pages", // <-- reposting page info
    required: true,
  },
  pagePost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PageRepost", pageRepostSchema);
