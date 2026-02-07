const express = require("express");
const Discussion = require("../models/Discussion");
const Reply = require("../models/Reply");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

/* CREATE DISCUSSION */
router.post("/", requireAuth, async (req, res) => {
  try {
    const discussion = await Discussion.create({
      ...req.body,
      author: req.user.id
    });

    res.status(201).json(discussion);
  } catch {
    res.status(500).json({ message: "Failed to create discussion" });
  }
});

/* GET ALL DISCUSSIONS */
router.get("/", async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate("author", "name role isDoctorVerified")
      .sort({ createdAt: -1 });

    res.json(discussions);
  } catch {
    res.status(500).json({ message: "Failed to fetch discussions" });
  }
});

/* GET SINGLE DISCUSSION + REPLIES */
router.get("/:id", async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate("author", "name role isDoctorVerified");

    const replies = await Reply.find({ discussion: req.params.id })
      .populate("doctor", "name role isDoctorVerified")
      .sort({ createdAt: 1 });

    res.json({ discussion, replies });
  } catch {
    res.status(404).json({ message: "Discussion not found" });
  }
});

module.exports = router;
