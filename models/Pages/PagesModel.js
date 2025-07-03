const mongoose = require("mongoose");

//Add Page Type

const PagesSchema = new mongoose.Schema(
  {
    pageName: { type: String, required: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 👇 Ensure unique entries by using Set-like array structure
    superAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    coAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    userName: { type: String, required: true },
    Category: { type: String, required: true },
    Phone: { type: Number },
    email: { type: String, required: true },
    Bio: { type: String },
    profileBackground: { type: String, required: true },
    Website: { type: String },
    isCreator: { type: Boolean, required: true, default: true },
    isVerified: { type: Boolean, default: false },
    profileImg: { type: String, required: true },
    date_of_birth: { type: String, required: true },
    gender: { type: String, required: true },
    profileAvatar: {
      path: { type: String },
      public_id: { type: String },
    },
    isActive: { type: Boolean, default: true },
    isPrivate: { type: Boolean, default: false },
    dvCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DVCards",
    },

    // 👉 Optional: track who added each admin in the future (for auditing)
    // adminHistory: [
    //   {
    //     addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //     role: { type: String, enum: ["super", "co"] },
    //     action: { type: String, enum: ["added", "removed"] },
    //     timestamp: { type: Date, default: Date.now }
    //   }
    // ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pages", PagesSchema);
