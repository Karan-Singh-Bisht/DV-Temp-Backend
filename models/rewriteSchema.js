// models/rewriteSchema.js
const mongoose = require("mongoose");

const rewriteSchema = new mongoose.Schema(
  {
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
    comment: {
      type: String, 
    },
    retweetedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rewrite", rewriteSchema);
