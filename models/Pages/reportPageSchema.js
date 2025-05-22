const mongoose = require("mongoose");

const ReportPageSchema = new mongoose.Schema(
  {
    pageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pages",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pages",
      required: true,
    },
    reason: { type: String, required: true },
    details: { type: String, required: true },
  },

  { TimeRanges: true }
);

module.exports = mongoose.model("ReportPage", ReportPageSchema);
