const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },

  content: {
    type: String,
    required: true
  },

  symptoms: {
    type: [String],
    required: true
  },

  age: Number,
  gender: String,
  region: String,

  category: {
    type: String,
    required: true
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  views: {
    type: Number,
    default: 0
  },

  likes: {
    type: Number,
    default: 0
  },

  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]

},
{ timestamps: true }
);

module.exports = mongoose.model("Discussion", discussionSchema);