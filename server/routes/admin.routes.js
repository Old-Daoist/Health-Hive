const express = require("express");
const DoctorVerification = require("../models/DoctorVerification");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

/* ADMIN ONLY CHECK */
router.use(requireAuth, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
});

/* GET ALL PENDING */
router.get("/verifications", async (req, res) => {
  const records = await DoctorVerification.find({ status: "pending" })
    .populate("user", "name email");
  res.json(records);
});

/* APPROVE */
router.post("/verify/:id/approve", async (req, res) => {
  const record = await DoctorVerification.findById(req.params.id);
  if (!record) return res.status(404).json({ message: "Not found" });

  record.status = "approved";
  record.reviewedBy = req.user.id;
  await record.save();

  await User.findByIdAndUpdate(record.user, {
    isDoctorVerified: true
  });

  res.json({ message: "Doctor approved" });
});

/* REJECT */
router.post("/verify/:id/reject", async (req, res) => {
  const record = await DoctorVerification.findById(req.params.id);
  if (!record) return res.status(404).json({ message: "Not found" });

  record.status = "rejected";
  record.reviewedBy = req.user.id;
  await record.save();

  res.json({ message: "Doctor rejected" });
});

module.exports = router;
