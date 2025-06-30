const mongoose = require("mongoose");

const dvCardsSchema = new mongoose.Schema({
  page: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pages",
  },
  cardFrontImage: {
    type: String,
    trim: true,
  },
  cardBackImage: {
    type: String,
    trim: true,
  },
  selfie: {
    type: String,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  designation: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  companyName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[0-9\s\-()]{7,20}$/, "Please enter a valid phone number"],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, "Website must be a valid URL"],
  },
  qrCodeURL: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
    enum: ["Personal", "Business", "Other"],
    default: "Other",
  },
  note: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  geolocation: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (val) {
          return val.length === 2 && val.every((n) => typeof n === "number");
        },
        message:
          "Coordinates must be an array of two numbers [longitude, latitude]",
      },
    },
  },
});

dvCardsSchema.index({ geolocation: "2dsphere" });

const DVCards = mongoose.model("DVCards", dvCardsSchema);
module.exports = DVCards;
