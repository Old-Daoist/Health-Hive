const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    symptoms: {
      type: String,
      required: true
    },

    duration: {
      type: String,
      required: true
    },

    age: Number,

    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },

    region: {
      type: String
    },

    category: {
      type: String,
      enum: [
        "general",
        "cardiology",
        "endocrinology",
        "psychiatry",
        "pediatrics",
        "orthopedics",
        "other"
      ],
      required: true
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discussion", discussionSchema);
