const express = require("express");
const Report = require("../models/Report");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

/* SUBMIT REPORT */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    const report = await Report.create({
      reporter: req.user.id,
      targetType,
      targetId,
      reason
    });

    res.status(201).json(report);
  } catch {
    res.status(500).json({ message: "Report failed" });
  }
});

module.exports = router;
