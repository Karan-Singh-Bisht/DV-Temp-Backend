const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  profileImg: { type: String },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  mailAddress: { type: String, required: true },
  bio: { type: String },
  link: { type: String },
  createdAt: { type: Date, default: Date.now },
  isPrivate: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
  bgColor: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  // Pages owned or created
  pages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pages" }],
  dvCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DVCards",
  },
  shoutOutCard: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShoutOut",
    },
  ],

  // 👇 Optionally track page roles for reverse referencing
  // adminOfPages: [{
  //   pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pages' },
  //   role: { type: String, enum: ["super", "co"] }
  // }]
});

module.exports = mongoose.model("User", UserSchema);
