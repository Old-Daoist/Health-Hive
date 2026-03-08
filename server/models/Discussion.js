const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },

  symptoms: {
    type: [String],
    required: true
  },

  age: {
    type: Number
  },

  gender: {
    type: String
  },

  region: {
    type: String
  },

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
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Discussion", discussionSchema);
