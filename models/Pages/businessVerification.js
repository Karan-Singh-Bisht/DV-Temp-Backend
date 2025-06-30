const mongoose = require("mongoose");

const businessVerificationSchema = new mongoose.Schema(
  {
    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pages",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    authorizedSelfie: {
      type: String,
      required: true,
    },
    businessPhoto: {
      type: String,
      required: true,
    },
    businessDoc: {
      type: String,
      required: true,
    },
    adminFullName: {
      type: String,
      required: true,
    },
    roleType: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /\S+@\S+\.\S+/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    link1: {
      type: String,
    },
    link2: {
      type: String,
    },
    link3: {
      type: String,
    },
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    rejectionReason: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const BusinessVerification = mongoose.model(
  "BusinessVerification",
  businessVerificationSchema
);

module.exports = BusinessVerification;
