const mongoose = require("mongoose");

const ReportPagePostSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    reason: { type: String, required: true },
    details: { type: String, required: true },
  },

  { TimeRanges: true }
);

module.exports = mongoose.model("ReportPagePost", ReportPagePostSchema);
