const mongoose = require("mongoose");

const ReportUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

module.exports = mongoose.model("ReportUser", ReportUserSchema);
