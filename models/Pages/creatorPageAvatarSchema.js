// models/Pages/creatorPageAvatarSchema.js
const mongoose = require('mongoose');

const CreatorPageAvatarSchema = new mongoose.Schema({
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pages",
  },
  category: {
    type: String,
    required: true,
  },
  avatarName: {
    path: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
});

module.exports = mongoose.model('CreatorPageAvatar', CreatorPageAvatarSchema);
