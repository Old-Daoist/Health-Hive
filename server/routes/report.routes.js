const express = require("express");
const Report  = require("../models/Report");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

/* ── SUBMIT REPORT ── */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    if (!targetType || !targetId || !reason)
      return res.status(400).json({ message: "targetType, targetId and reason are required" });

    // Prevent duplicate reports from same user on same target
    const existing = await Report.findOne({ reporter: req.user.id, targetId });
    if (existing)
      return res.status(400).json({ message: "You have already reported this content" });

    const report = await Report.create({ reporter: req.user.id, targetType, targetId, reason });
    res.status(201).json(report);
  } catch {
    res.status(500).json({ message: "Report failed" });
  }
});

/* ── ADMIN: GET ALL REPORTS ── */
router.get("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admins only" });
    const reports = await Report.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("reporter", "firstName lastName email");
    res.json(reports);
  } catch {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});

/* ── ADMIN: RESOLVE / DISMISS ── */
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admins only" });
    const { status } = req.body; // "resolved" | "dismissed"
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user.id },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch {
    res.status(500).json({ message: "Failed to update report" });
  }
});

module.exports = router;