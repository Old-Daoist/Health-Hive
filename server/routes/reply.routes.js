const express = require("express");
const Reply = require("../models/Reply");
const Discussion = require("../models/Discussion");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

/* ===========================
CREATE REPLY
=========================== */

router.post("/:discussionId", requireAuth, async (req, res) => {
  try {

    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Reply content is required"
      });
    }

    // Ensure discussion exists
    const discussion = await Discussion.findById(req.params.discussionId);

    if (!discussion) {
      return res.status(404).json({
        message: "Discussion not found"
      });
    }

    const reply = await Reply.create({
      discussion: req.params.discussionId,
      author: req.user.id,
      content
    });

    const populatedReply = await Reply.findById(reply._id)
      .populate("author", "firstName lastName role isDoctorVerified");

    res.status(201).json({
      success: true,
      reply: populatedReply
    });

  } catch (error) {

    console.error("Reply error:", error.message);

    res.status(500).json({
      message: "Reply failed"
    });

  }
});


/* ===========================
GET REPLIES FOR DISCUSSION
=========================== */

router.get("/:discussionId", async (req, res) => {
  try {

    const replies = await Reply.find({
      discussion: req.params.discussionId
    })
    .populate("author", "firstName lastName role isDoctorVerified")
    .sort({ createdAt: 1 });

    res.json({
      success: true,
      replies
    });

  } catch (error) {

    console.error("Fetch replies error:", error.message);

    res.status(500).json({
      message: "Failed to fetch replies"
    });

  }
});


module.exports = router;