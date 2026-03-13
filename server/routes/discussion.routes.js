const express = require("express");
const Discussion = require("../models/Discussion");
const Reply = require("../models/Reply");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

/* ===========================
CREATE DISCUSSION
=========================== */

router.post("/", requireAuth, async (req, res) => {
try {

const { title, content, symptoms, category, age, gender, region } = req.body;

if (!title || !content || !symptoms || !category) {
  return res.status(400).json({
    message: "Title, content, symptoms and category are required",
  });
}

const discussion = await Discussion.create({
  title,
  content,
  symptoms,
  category,
  age,
  gender,
  region,
  author: req.user.id,
  likes: 0,
  views: 0
});

const populatedDiscussion = await Discussion.findById(discussion._id)
  .populate("author", "firstName lastName role isDoctorVerified");

// Emit real-time event to all connected clients
const io = global.io;
if (io) {
  io.emit("newDiscussion", { ...populatedDiscussion.toObject(), replyCount: 0 });
}

res.status(201).json({
  success: true,
  discussion: populatedDiscussion
});

} catch (error) {
console.error("Create discussion error:", error.message);

res.status(500).json({
  message: "Failed to create discussion"
});

}
});

/* ===========================
GET ALL DISCUSSIONS
=========================== */

router.get("/", async (req, res) => {

try {

// Optionally read the auth token to personalise isLiked/isBookmarked
let userId = null;
const authHeader = req.headers.authorization;
if (authHeader) {
  try {
    const token = authHeader.split(" ")[1];
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch { /* token invalid/missing – anonymous view is fine */ }
}

// Also fetch the user's bookmarks if logged in
let userBookmarks = [];
if (userId) {
  const User = require("../models/User");
  const u = await User.findById(userId).select("bookmarks");
  if (u) userBookmarks = u.bookmarks.map(id => id.toString());
}

const { sort, category, symptom, search } = req.query;

let filter = {};

if (category) {
  filter.category = category;
}

if (symptom) {
  filter.symptoms = symptom;
}

if (search) {
  filter.$or = [
    { title: { $regex: search, $options: "i" } },
    { content: { $regex: search, $options: "i" } }
  ];
}

let sortOption = { createdAt: -1 };

if (sort === "popular") sortOption = { views: -1 };
if (sort === "liked") sortOption = { likes: -1 };

const discussions = await Discussion.find(filter)
  .populate("author", "firstName lastName role isDoctorVerified")
  .sort(sortOption);

const discussionsWithReplies = await Promise.all(
  discussions.map(async (d) => {

    const replyCount = await Reply.countDocuments({
      discussion: d._id
    });

    const obj = d.toObject();
    const isLiked = userId
      ? (obj.likedBy || []).some(id => id.toString() === userId)
      : false;
    const isBookmarked = userId
      ? userBookmarks.includes(obj._id.toString())
      : false;

    return {
      ...obj,
      replyCount,
      isLiked,
      isBookmarked,
    };

  })
);

res.json({
  success: true,
  discussions: discussionsWithReplies
});

} catch (error) {

console.error("Fetch discussions error:", error.message);

res.status(500).json({
  message: "Failed to fetch discussions"
});

}
});

/* ===========================
GET SINGLE DISCUSSION
=========================== */

router.get("/:id", async (req, res) => {

try {

// Detect logged-in user for isLiked/isBookmarked
let userId = null;
const authHeader = req.headers.authorization;
if (authHeader) {
  try {
    const token = authHeader.split(" ")[1];
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch { /* anonymous */ }
}

const discussion = await Discussion.findByIdAndUpdate(
  req.params.id,
  { $inc: { views: 1 } },
  { new: true }
).populate("author", "firstName lastName role isDoctorVerified");

if (!discussion) {
  return res.status(404).json({ message: "Discussion not found" });
}

let isBookmarked = false;
if (userId) {
  const User = require("../models/User");
  const u = await User.findById(userId).select("bookmarks");
  if (u) isBookmarked = u.bookmarks.some(id => id.toString() === req.params.id);
}

const isLiked = userId
  ? (discussion.likedBy || []).some(id => id.toString() === userId)
  : false;

const mongoose = require("mongoose");

const replies = await Reply.find({
  discussion: new mongoose.Types.ObjectId(req.params.id)
})
.populate("author", "firstName lastName role isDoctorVerified")
.sort({ createdAt: 1 });

res.json({
  success: true,
  discussion: { ...discussion.toObject(), isLiked, isBookmarked },
  replies
});

} catch (error) {

console.error("Fetch single discussion error:", error.message);

res.status(404).json({
  message: "Discussion not found"
});

}
});

/* ===========================
LIKE DISCUSSION
=========================== */

router.post("/:id/like", requireAuth, async (req, res) => {

try {
const discussion = await Discussion.findById(req.params.id);

if (!discussion) {
  return res.status(404).json({
    message: "Discussion not found"
  });
}

if (!discussion.likedBy) {
  discussion.likedBy = [];
}

const alreadyLiked = discussion.likedBy.some(
  id => id.toString() === req.user.id
);

if (alreadyLiked) {

  discussion.likedBy = discussion.likedBy.filter(
    id => id.toString() !== req.user.id
  );

  discussion.likes -= 1;

} else {

  discussion.likedBy.push(req.user.id);

  discussion.likes += 1;

}

await discussion.save();

res.json({
  success: true,
  likes: discussion.likes,
  isLiked: !alreadyLiked
});

} catch (error) {

console.error("Like discussion error:", error.message);

res.status(500).json({
  message: "Failed to like discussion"
});

}

});

/* ===========================
BOOKMARK DISCUSSION
=========================== */

router.post("/:id/bookmark", requireAuth, async (req, res) => {

try {

const User = require("../models/User");

// req.user is a plain JWT payload — must fetch the real Mongoose document
const user = await User.findById(req.user.id);
if (!user) return res.status(404).json({ message: "User not found" });

const discussionId = req.params.id;
const alreadyBookmarked = user.bookmarks.some(
  id => id.toString() === discussionId
);

if (alreadyBookmarked) {
  user.bookmarks = user.bookmarks.filter(
    id => id.toString() !== discussionId
  );
} else {
  user.bookmarks.push(discussionId);
}

await user.save();

res.json({
  success: true,
  isBookmarked: !alreadyBookmarked
});

} catch (error) {
console.error("Bookmark error:", error.message);

res.status(500).json({
  message: "Bookmark failed"
});

}

});

/* ===========================
GET USER BOOKMARKS
=========================== */

router.get("/bookmarks/me", requireAuth, async (req, res) => {

try {
const discussions = await Discussion.find({
  _id: { $in: req.user.bookmarks || [] }
})
  .populate("author", "firstName lastName role isDoctorVerified")
  .sort({ createdAt: -1 });

res.json({
  success: true,
  discussions
});

} catch (error) {
console.error("Fetch bookmarks error:", error.message);

res.status(500).json({
  message: "Failed to fetch bookmarks"
});

}

});

module.exports = router;