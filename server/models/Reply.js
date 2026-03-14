const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
{
  discussion: { type: mongoose.Schema.Types.ObjectId, ref: "Discussion", required: true },
  author:     { type: mongoose.Schema.Types.ObjectId, ref: "User",       required: true },
  content:    { type: String, required: true },

  /* Reply-to threading */
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reply",
    default: null,
  },

  /* Reactions */
  likes:    { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
},
{ timestamps: true }
);

module.exports = mongoose.model("Reply", replySchema);