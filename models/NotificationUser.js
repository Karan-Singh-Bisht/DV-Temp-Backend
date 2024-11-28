const mongoose = require('mongoose');

const NotificationUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Fixed typo: refs -> ref
    required: true,
  },
  notifications: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who triggered the notification
      type: { type: String,  required: true }, // Type of notification
      message: { type: String, required: true }, // Description or message for the notification
      isRead: { type: Boolean, default: false }, // Whether the notification has been read
      createdAt: { type: Date, default: Date.now }, // Timestamp
    }
  ],
});

const NotificationUser = mongoose.model('NotificationUser', NotificationUserSchema);

module.exports = NotificationUser;
