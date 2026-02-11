const express = require("express");
const Reply = require("../models/Reply");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

/* ===========================
   DOCTOR REPLY
=========================== */
router.post("/:discussionId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "doctor" || !req.user.isDoctorVerified) {
      return res.status(403).json({
        message: "Only verified doctors can reply",
      });
    }

    const reply = await Reply.create({
      discussion: req.params.discussionId,
      doctor: req.user.id,
      content: req.body.content,
    });

    const populatedReply = await Reply.findById(reply._id)
      .populate("doctor", "name role isDoctorVerified");

    res.status(201).json({
      success: true,
      reply: populatedReply,
    });

  } catch (error) {
    console.error("Reply error:", error.message);
    res.status(500).json({ message: "Reply failed" });
  }
});

module.exports = router;
