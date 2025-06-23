const mongoose = require("mongoose");

const UserVerificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    authorizedSelfie: {
      type: String,
      required: true,
    },
    identityDocument: {
      type: String,
    },
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    rejectionReason: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const UserVerification = mongoose.model(
  "UserVerification",
  UserVerificationSchema
);

module.exports = UserVerification;
