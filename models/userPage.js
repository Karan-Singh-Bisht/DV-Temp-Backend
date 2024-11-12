const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  isCreator: { type: Boolean, default: false },
  pageName: { type: String, required: true },
  pageImg: { type: String},
  username: { type: String, required: true},
  category: { type: String, required: true },
  phoneNumber: { type: Number, required: true, unique: true },
  mailAddress: { type: String, required: true},
  bio: { type: String},
  website: { type: String},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);