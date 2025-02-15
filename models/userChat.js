const mongoose = require('mongoose');

const userChatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserMessage',
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model('UserChat', userChatSchema);
