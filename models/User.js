const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  profileImg: { type: String },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  phoneNumber: { type: Number, required: true, unique: true },
  mailAddress: { type: String, required: true },
  bio: { type: String },
  link: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  pages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pages' }] // Reference to Page model
});

module.exports = mongoose.model("User", UserSchema);
