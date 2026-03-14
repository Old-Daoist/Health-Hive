const express = require("express");
const Reply = require("../models/Reply");
const Discussion = require("../models/Discussion");
const { requireAuth } = require("../middleware/auth.middleware");
const { createNotification } = require("./notification.routes");

const router = express.Router();

/* ── helpers ── */
const populate = (q) =>
  q.populate("author", "firstName lastName role isDoctorVerified")
   .populate({ path: "replyTo", populate: { path: "author", select: "firstName lastName" } });

/* ── CREATE REPLY ── */
router.post("/:discussionId", requireAuth, async (req, res) => {
  try {
    const { content, replyToId } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Reply content is required" });

    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });

    const reply = await Reply.create({
      discussion: req.params.discussionId,
      author: req.user.id,
      content,
      replyTo: replyToId || null,
    });

    const populated = await populate(Reply.findById(reply._id));

    const io = global.io;
    if (io) {
      io.to(`discussion:${req.params.discussionId}`).emit("newReply", populated);
      io.emit("replyCountUpdate", { discussionId: req.params.discussionId });
    }

    // Notify discussion author
    if (discussion.author.toString() !== req.user.id.toString()) {
      createNotification({
        recipient: discussion.author,
        sender: req.user.id,
        type: "reply",
        message: `${req.user.name} replied to your discussion "${discussion.title.slice(0, 60)}"`,
        discussionId: discussion._id,
        link: discussion._id.toString(),
      }).catch(console.error);
    }

    // Notify the person being replied to
    if (replyToId) {
      const parentReply = await Reply.findById(replyToId);
      if (parentReply && parentReply.author.toString() !== req.user.id.toString()) {
        createNotification({
          recipient: parentReply.author,
          sender: req.user.id,
          type: "reply",
          message: `${req.user.name} replied to your comment`,
          discussionId: discussion._id,
          link: discussion._id.toString(),
        }).catch(console.error);
      }
    }

    res.status(201).json({ success: true, reply: populated });
  } catch (err) {
    console.error("Reply error:", err.message);
    res.status(500).json({ message: "Reply failed" });
  }
});

/* ── GET REPLIES ── */
router.get("/:discussionId", async (req, res) => {
  try {
    const replies = await populate(
      Reply.find({ discussion: req.params.discussionId }).sort({ createdAt: 1 })
    );
    res.json({ success: true, replies });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch replies" });
  }
});

/* ── LIKE REPLY ── */
router.post("/:replyId/like", requireAuth, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    const uid = req.user.id.toString();
    const alreadyLiked    = reply.likedBy.some(id => id.toString() === uid);
    const alreadyDisliked = reply.dislikedBy.some(id => id.toString() === uid);

    if (alreadyLiked) {
      // Unlike
      reply.likedBy = reply.likedBy.filter(id => id.toString() !== uid);
      reply.likes = Math.max(0, reply.likes - 1);
    } else {
      // Like — remove dislike first if exists
      if (alreadyDisliked) {
        reply.dislikedBy = reply.dislikedBy.filter(id => id.toString() !== uid);
        reply.dislikes = Math.max(0, reply.dislikes - 1);
      }
      reply.likedBy.push(req.user.id);
      reply.likes += 1;
    }

    await reply.save();
    res.json({ success: true, likes: reply.likes, dislikes: reply.dislikes, isLiked: !alreadyLiked, isDisliked: false });
  } catch (err) {
    res.status(500).json({ message: "Failed to like reply" });
  }
});

/* ── DISLIKE REPLY ── */
router.post("/:replyId/dislike", requireAuth, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    const uid = req.user.id.toString();
    const alreadyDisliked = reply.dislikedBy.some(id => id.toString() === uid);
    const alreadyLiked    = reply.likedBy.some(id => id.toString() === uid);

    if (alreadyDisliked) {
      reply.dislikedBy = reply.dislikedBy.filter(id => id.toString() !== uid);
      reply.dislikes = Math.max(0, reply.dislikes - 1);
    } else {
      if (alreadyLiked) {
        reply.likedBy = reply.likedBy.filter(id => id.toString() !== uid);
        reply.likes = Math.max(0, reply.likes - 1);
      }
      reply.dislikedBy.push(req.user.id);
      reply.dislikes += 1;
    }

    await reply.save();
    res.json({ success: true, likes: reply.likes, dislikes: reply.dislikes, isLiked: false, isDisliked: !alreadyDisliked });
  } catch (err) {
    res.status(500).json({ message: "Failed to dislike reply" });
  }
});

/* ── DELETE REPLY ── */
router.delete("/:replyId", requireAuth, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });
    if (reply.author.toString() !== req.user.id.toString())
      return res.status(403).json({ message: "Not authorized" });
    await reply.deleteOne();
    res.json({ message: "Reply deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete reply" });
  }
});

module.exports = router;