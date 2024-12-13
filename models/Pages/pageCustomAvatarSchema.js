const mongoose = require('mongoose');

const CustomPageAvatarSchema = new mongoose.Schema({
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pages" 
},
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

const CustomPageAvatar = mongoose.model('CustomPageAvatar', CustomPageAvatarSchema)
module.exports = CustomPageAvatar;
