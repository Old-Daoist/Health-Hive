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
    const {
      title,
      symptoms,
      duration,
      age,
      gender,
      region,
      category,
    } = req.body;

    if (!title || !symptoms || !duration || !category) {
      return res.status(400).json({
        message: "Title, symptoms, duration and category are required",
      });
    }

    const discussion = await Discussion.create({
      title,
      symptoms,
      duration,
      age,
      gender,
      region,
      category,
      author: req.user.id, // 🔥 THIS is important
    });

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate("author", "name role isDoctorVerified");

    res.status(201).json({
      success: true,
      discussion: populatedDiscussion,
    });

  } catch (error) {
    console.error("Create discussion error:", error.message);
    res.status(500).json({ message: "Failed to create discussion" });
  }
});

/* ===========================
   GET ALL DISCUSSIONS
=========================== */
router.get("/", async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate("author", "name role isDoctorVerified")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      discussions,
    });
  } catch (error) {
    console.error("Fetch discussions error:", error.message);
    res.status(500).json({ message: "Failed to fetch discussions" });
  }
});

/* ===========================
   GET SINGLE DISCUSSION
=========================== */
router.get("/:id", async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate("author", "name role isDoctorVerified");

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const replies = await Reply.find({ discussion: req.params.id })
      .populate("doctor", "name role isDoctorVerified")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      discussion,
      replies,
    });

  } catch (error) {
    console.error("Fetch single discussion error:", error.message);
    res.status(404).json({ message: "Discussion not found" });
  }
});

module.exports = router;
