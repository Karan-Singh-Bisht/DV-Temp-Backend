const mongoose = require("mongoose");

const PostSaveSchema = new mongoose.Schema({
    pageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pages" 
    },
    savedPosts: [
        {
       
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ]
});

// Create a model from the schema
const PostSave = mongoose.model("PostSave", PostSaveSchema);

module.exports = PostSave;
