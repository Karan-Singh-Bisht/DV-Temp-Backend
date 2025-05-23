const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userPost",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: { type: String, required: true },
    details: { type: String, required: true },
  },

  { TimeRanges: true }
);

module.exports = mongoose.model("Report", reportSchema);
