const express = require("express");
const Reply = require("../models/Reply");
const Discussion = require("../models/Discussion");
const { requireAuth } = require("../middleware/auth.middleware");
const { createNotification } = require("./notification.routes");

const router = express.Router();

/* CREATE REPLY */
router.post("/:discussionId", requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Reply content is required" });

    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });

    const reply = await Reply.create({
      discussion: req.params.discussionId,
      author: req.user.id,
      content,
    });

    const populated = await Reply.findById(reply._id)
      .populate("author", "firstName lastName role isDoctorVerified");

    const io = global.io;
    if (io) {
      io.to(`discussion:${req.params.discussionId}`).emit("newReply", populated);
      io.emit("replyCountUpdate", { discussionId: req.params.discussionId });
    }

    // Notify discussion author (not if replying to own post)
    if (discussion.author.toString() !== req.user.id.toString()) {
      await createNotification({
        recipient: discussion.author,
        sender: req.user.id,
        type: "reply",
        message: `${req.user.name} replied to your discussion "${discussion.title.slice(0, 60)}"`,
        discussionId: discussion._id,
        link: discussion._id.toString(),
      });
    }

    res.status(201).json({ success: true, reply: populated });
  } catch (err) {
    console.error("Reply error:", err.message);
    res.status(500).json({ message: "Reply failed" });
  }
});

/* GET REPLIES */
router.get("/:discussionId", async (req, res) => {
  try {
    const replies = await Reply.find({ discussion: req.params.discussionId })
      .populate("author", "firstName lastName role isDoctorVerified")
      .sort({ createdAt: 1 });
    res.json({ success: true, replies });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch replies" });
  }
});

module.exports = router;