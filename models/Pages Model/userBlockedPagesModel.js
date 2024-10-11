const mongoose = require("mongoose");

const UserBlockPagesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  blockedList: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Pages", 
    },
  ],
});

// Create a model from the schema
const UserBlockPages = mongoose.model("UserBlockPages", UserBlockPagesSchema);

module.exports = UserBlockPages;
