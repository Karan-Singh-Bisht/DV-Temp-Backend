const mongoose = require("mongoose");

const InfonicsSchema = new mongoose.Schema({
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: "Page", required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  bio: { type: String },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  company: { type: String },
  website: { type: String },
  lookingFor: [{ type: String }], // Array of keywords
  visibility: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Infonics", InfonicsSchema);
