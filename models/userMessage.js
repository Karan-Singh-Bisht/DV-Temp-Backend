const mongoose = require('mongoose');

const userMessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserChat',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    deletedFor: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UserMessage', userMessageSchema);
