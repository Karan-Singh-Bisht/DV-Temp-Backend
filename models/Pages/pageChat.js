const mongoose = require('mongoose');

const pageChatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PageMessage',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PageChat', pageChatSchema);
