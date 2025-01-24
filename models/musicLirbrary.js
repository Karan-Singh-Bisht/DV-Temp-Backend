const mongoose = require("mongoose");

const musicLibrarySchema = mongoose.Schema({
    
  musicName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    Required: true,

  },
  musicAudio: {
    path: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
});

const MusicLibrary = mongoose.model("MusicLibrary", musicLibrarySchema);
module.exports = MusicLibrary;
