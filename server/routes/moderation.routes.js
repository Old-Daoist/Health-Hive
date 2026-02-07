const express = require("express");
const Report = require("../models/Report");
const Reply = require("../models/Reply");
const Discussion = require("../models/Discussion");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

/* ADMIN ONLY */
router.use(requireAuth, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
});

/* GET ALL REPORTS */
router.get("/reports", async (req, res) => {
  const reports = await Report.find()
    .populate("reporter", "name email")
    .sort({ createdAt: -1 });

  res.json(reports);
});

/* RESOLVE REPORT */
router.post("/reports/:id/resolve", async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Not found" });

  // Optional enforcement
  if (report.targetType === "reply") {
    await Reply.findByIdAndUpdate(report.targetId, {
      status: "rejected"
    });
  }

  if (report.targetType === "discussion") {
    await Discussion.findByIdAndDelete(report.targetId);
  }

  report.status = "resolved";
  report.reviewedBy = req.user.id;
  await report.save();

  res.json({ message: "Report resolved" });
});

/* DISMISS REPORT */
router.post("/reports/:id/dismiss", async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Not found" });

  report.status = "dismissed";
  report.reviewedBy = req.user.id;
  await report.save();

  res.json({ message: "Report dismissed" });
});

module.exports = router;
