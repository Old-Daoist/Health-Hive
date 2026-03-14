const express = require("express");
const Discussion = require("../models/Discussion");
const Reply = require("../models/Reply");
const { requireAuth } = require("../middleware/auth.middleware");
const { createNotification } = require("./notification.routes");

const router = express.Router();

/* ===========================
CREATE DISCUSSION
=========================== */

router.post("/", requireAuth, async (req, res) => {
try {

const { title, content, symptoms, category, age, gender, region, tags } = req.body;

if (!title || !content || !symptoms || !category) {
  return res.status(400).json({
    message: "Title, content, symptoms and category are required",
  });
}

if (title.trim().length < 5)
  return res.status(400).json({ message: "Title must be at least 5 characters" });
if (title.trim().length > 200)
  return res.status(400).json({ message: "Title must be under 200 characters" });
if (content.trim().length < 10)
  return res.status(400).json({ message: "Content must be at least 10 characters" });
if (content.trim().length > 5000)
  return res.status(400).json({ message: "Content must be under 5000 characters" });
if (!Array.isArray(symptoms) || symptoms.length === 0)
  return res.status(400).json({ message: "At least one symptom is required" });

const discussion = await Discussion.create({
  title: title.trim(),
  content: content.trim(),
  symptoms,
  category,
  tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
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

const { sort, category, symptom, search, page = 1, limit = 20 } = req.query;

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
    { content: { $regex: search, $options: "i" } },
    { tags: { $regex: search, $options: "i" } }
  ];
}

let sortOption = { createdAt: -1 };

if (sort === "popular") sortOption = { views: -1 };
if (sort === "liked") sortOption = { likes: -1 };

const pageNum = Math.max(1, parseInt(page));
const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
const skip = (pageNum - 1) * limitNum;

const total = await Discussion.countDocuments(filter);

const discussions = await Discussion.find(filter)
  .populate("author", "firstName lastName role isDoctorVerified")
  .sort(sortOption)
  .skip(skip)
  .limit(limitNum);

const discussionsWithReplies = await Promise.all(
  discussions.map(async (d) => {

    const replyCount = await Reply.countDocuments({
      discussion: d._id
    });

    const obj = d.toObject();
    const isLiked = userId
      ? (obj.likedBy || []).some(id => id.toString() === userId)
      : false;
    const isDisliked = userId
      ? (obj.dislikedBy || []).some(id => id.toString() === userId)
      : false;
    const isBookmarked = userId
      ? userBookmarks.includes(obj._id.toString())
      : false;

    return {
      ...obj,
      replyCount,
      isLiked,
      isDisliked,
      isBookmarked,
    };

  })
);

res.json({
  success: true,
  discussions: discussionsWithReplies,
  pagination: {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
    hasMore: pageNum * limitNum < total,
  }
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

const isDisliked = userId
  ? (discussion.dislikedBy || []).some(id => id.toString() === userId)
  : false;

const mongoose = require("mongoose");

const replies = await Reply.find({
  discussion: new mongoose.Types.ObjectId(req.params.id)
})
.populate("author", "firstName lastName role isDoctorVerified")
.populate({ path: "replyTo", populate: { path: "author", select: "firstName lastName" } })
.sort({ createdAt: 1 });

// Attach isLiked / isDisliked per reply for the current user
const repliesWithReactions = replies.map(r => {
  const obj = r.toObject();
  obj.isLiked    = userId ? (r.likedBy    || []).some(id => id.toString() === userId) : false;
  obj.isDisliked = userId ? (r.dislikedBy || []).some(id => id.toString() === userId) : false;
  return obj;
});

res.json({
  success: true,
  discussion: { ...discussion.toObject(), isLiked, isDisliked, isBookmarked },
  replies: repliesWithReactions
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
  return res.status(404).json({ message: "Discussion not found" });
}

// Prevent liking your own post
if (discussion.author.toString() === req.user.id.toString()) {
  return res.status(400).json({ message: "You cannot like your own post" });
}

if (!discussion.likedBy)    discussion.likedBy    = [];
if (!discussion.dislikedBy) discussion.dislikedBy = [];

const uid = req.user.id.toString();
const alreadyLiked    = discussion.likedBy.some(id => id.toString() === uid);
const alreadyDisliked = discussion.dislikedBy.some(id => id.toString() === uid);

if (alreadyLiked) {
  discussion.likedBy = discussion.likedBy.filter(id => id.toString() !== uid);
  discussion.likes = Math.max(0, discussion.likes - 1);
} else {
  if (alreadyDisliked) {
    discussion.dislikedBy = discussion.dislikedBy.filter(id => id.toString() !== uid);
    discussion.dislikes = Math.max(0, (discussion.dislikes || 0) - 1);
  }
  discussion.likedBy.push(req.user.id);
  discussion.likes += 1;
}

await discussion.save();

if (!alreadyLiked) {
  createNotification({
    recipient: discussion.author,
    sender: req.user.id,
    type: "like",
    message: `${req.user.name} liked your discussion "${discussion.title.slice(0, 60)}"`,
    discussionId: discussion._id,
    link: discussion._id.toString(),
  }).catch(console.error);
}

res.json({
  success: true,
  likes: discussion.likes,
  dislikes: discussion.dislikes || 0,
  isLiked: !alreadyLiked,
  isDisliked: false,
});

} catch (error) {

console.error("Like discussion error:", error.message);

res.status(500).json({
  message: "Failed to like discussion"
});

}

});

/* ===========================
DISLIKE DISCUSSION
=========================== */

router.post("/:id/dislike", requireAuth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });

    if (discussion.author.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: "You cannot dislike your own post" });
    }

    if (!discussion.dislikedBy) discussion.dislikedBy = [];
    if (!discussion.likedBy)    discussion.likedBy    = [];

    const uid = req.user.id.toString();
    const alreadyDisliked = discussion.dislikedBy.some(id => id.toString() === uid);
    const alreadyLiked    = discussion.likedBy.some(id => id.toString() === uid);

    if (alreadyDisliked) {
      discussion.dislikedBy = discussion.dislikedBy.filter(id => id.toString() !== uid);
      discussion.dislikes = Math.max(0, (discussion.dislikes || 0) - 1);
    } else {
      // Remove like if exists
      if (alreadyLiked) {
        discussion.likedBy = discussion.likedBy.filter(id => id.toString() !== uid);
        discussion.likes = Math.max(0, discussion.likes - 1);
      }
      discussion.dislikedBy.push(req.user.id);
      discussion.dislikes = (discussion.dislikes || 0) + 1;
    }

    await discussion.save();
    res.json({
      success: true,
      dislikes: discussion.dislikes,
      likes: discussion.likes,
      isDisliked: !alreadyDisliked,
      isLiked: false,
    });
  } catch (error) {
    console.error("Dislike discussion error:", error.message);
    res.status(500).json({ message: "Failed to dislike discussion" });
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
const User = require("../models/User");
const user = await User.findById(req.user.id).select("bookmarks");
const discussions = await Discussion.find({
  _id: { $in: user?.bookmarks || [] }
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
/* ===========================
EDIT DISCUSSION
=========================== */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });
    if (discussion.author.toString() !== req.user.id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const { title, content, category, symptoms, tags } = req.body;
    if (title && title.trim().length < 5)
      return res.status(400).json({ message: "Title must be at least 5 characters" });
    if (content && content.trim().length > 5000)
      return res.status(400).json({ message: "Content must be under 5000 characters" });

    discussion.title    = title?.trim()    || discussion.title;
    discussion.content  = content?.trim()  || discussion.content;
    discussion.category = category         || discussion.category;
    discussion.symptoms = symptoms         || discussion.symptoms;
    discussion.tags     = Array.isArray(tags) ? tags.slice(0, 10) : discussion.tags;
    await discussion.save();

    const updated = await Discussion.findById(discussion._id)
      .populate("author", "firstName lastName role isDoctorVerified");
    res.json({ success: true, discussion: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update discussion" });
  }
});

/* ===========================
DELETE DISCUSSION
=========================== */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });
    if (discussion.author.toString() !== req.user.id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    await Reply.deleteMany({ discussion: req.params.id });
    await discussion.deleteOne();

    if (global.io) global.io.emit("discussionDeleted", { id: req.params.id });
    res.json({ message: "Discussion deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete discussion" });
  }
});

/* ===========================
SEARCH USERS
=========================== */
router.get("/search/users", requireAuth, async (req, res) => {
  try {
    const User = require("../models/User");
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ users: [] });
    const users = await User.find({
      $or: [
        { firstName: { $regex: q, $options: "i" } },
        { lastName:  { $regex: q, $options: "i" } },
        { email:     { $regex: q, $options: "i" } },
      ]
    }).select("firstName lastName email role isDoctorVerified avatar").limit(10);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
});