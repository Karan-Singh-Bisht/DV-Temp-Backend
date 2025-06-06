const mongoose = require("mongoose");

const ILikedPostsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ILikedPosts", ILikedPostsSchema);
