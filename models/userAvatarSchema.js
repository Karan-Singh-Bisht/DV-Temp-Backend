const mongoose = require('mongoose');

const userAvatarSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true, // Make it required if every user must have a category
  },
  avatarName: {
    path: {
      type: String,
      required: true, // Ensure path is always provided
    },
    public_id: {
      type: String,
      required: true, // Ensure public_id is always provided
    },
  },
});

const userAvatar = mongoose.model('UserAvatar', userAvatarSchema)
module.exports = userAvatar;
