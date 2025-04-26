const mongoose = require('mongoose');

const pageMessageSchema = new mongoose.Schema(
  {
    senderPageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pages',
      required: true,
    },
    recipientPageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pages',
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
      ref: 'Pages',
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PageMessage', pageMessageSchema);
