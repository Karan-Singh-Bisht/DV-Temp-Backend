// models/pageRewrite.js
const mongoose = require("mongoose");

const pageRewriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pagePost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  comment: {
    type: String,
  },
  pinned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model("PageRewrite", pageRewriteSchema);
