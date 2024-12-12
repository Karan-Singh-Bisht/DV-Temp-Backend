// models/rewriteSchema.js
const mongoose = require("mongoose");

const rewriteSchema = new mongoose.Schema(
    {  
        pageId: {
          type: mongoose.Types.ObjectId,
          ref: "Pages",
          required: true,
        },
    originalPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
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
