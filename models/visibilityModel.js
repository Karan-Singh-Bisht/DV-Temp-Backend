const mongoose = require('mongoose');

const visibilitySchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId, // Fixed reference to ObjectId
        ref: "User",
        required: true, // Assuming userId is mandatory
    },
    type: {
        type: String,
        required: true,
        enum: ["buddy", "includes", "excludes"], // Corrected enum values
    },
    includes: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
        }
    ],
    excludes: [ // Corrected spelling from "exludes"
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
        }
    ],
});

module.exports = mongoose.model('Visibility', visibilitySchema);
