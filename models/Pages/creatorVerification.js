const mongoose = require("mongoose");
const creatorVerificationSchema = new mongoose.Schema({
  page: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pages",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /\S+@\S+\.\S+/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  authorizedSelfie: {
    type: String,
  },
  professionalDoc: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  link1: {
    type: String,
  },
  link2: {
    type: String,
  },
  link3: {
    type: String,
  },
});

const CreatorVerification = mongoose.model(
  "CreatorVerification",
  creatorVerificationSchema
);

module.exports = CreatorVerification;
