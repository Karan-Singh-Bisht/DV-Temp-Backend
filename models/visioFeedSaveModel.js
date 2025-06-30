const mongoose = require("mongoose");

const visioFeedSaveSchema = new mongoose.Schema({
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pages",
  },
  savedVisioFeeds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visiofeed",
    },
  ],
});

const VisioFeedSave = mongoose.model("VisioFeedSave", visioFeedSaveSchema);
module.exports = VisioFeedSave;
