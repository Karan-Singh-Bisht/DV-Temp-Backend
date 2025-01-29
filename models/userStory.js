const mongoose = require("mongoose");

const UserStorySchema = new mongoose.Schema({
  media: {
    path: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

const UserStory = mongoose.model("UserStory", UserStorySchema);

module.exports = UserStory;
