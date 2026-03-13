const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
{
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Discussion",
    required: false
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  content: {
    type: String,
    required: true
  },

  likes: {
    type: Number,
    default: 0
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Reply", replySchema);
