const mongoose = require("mongoose");

const userSavePostsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  savedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userPost",
      required: true,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("userSavePosts", userSavePostsSchema);
