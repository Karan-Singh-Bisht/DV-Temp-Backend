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
    reason: { type: String, required: true, maxLength: 500 },
    resolved: { type: Boolean, default: false },
    actionTaken: {
      type: String,
      enum: ["none", "warning", "suspended"],
      default: "none",
    },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    resolvedAt: { type: Date },
    resolverComments: { type: String, trim: true, maxLength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReportUser", ReportUserSchema);
