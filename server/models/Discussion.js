const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  authorName: String,
  authorType: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const DiscussionSchema = new mongoose.Schema({
  title: String,
  body: String,
  category: String,
  authorName: String,
  authorType: String,
  likes: { type: Number, default: 0 },
  comments: [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model("Discussion", DiscussionSchema);
