const express = require("express");
const DoctorVerification = require("../models/DoctorVerification");
const User       = require("../models/User");
const Discussion = require("../models/Discussion");
const Report     = require("../models/Report");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

/* ── Admin-only guard ── */
router.use(requireAuth, (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admins only" });
  next();
});

/* ── STATS ── */
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalDoctors, totalDiscussions, pendingVerifications, openReports] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "doctor" }),
        Discussion.countDocuments(),
        DoctorVerification.countDocuments({ status: "pending" }),
        Report.countDocuments({ status: "pending" }),
      ]);
    res.json({ totalUsers, totalDoctors, totalDiscussions, pendingVerifications, openReports });
  } catch {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/* ── VERIFICATIONS (original) ── */
router.get("/verifications", async (req, res) => {
  const records = await DoctorVerification.find({ status: "pending" })
    .populate("user", "name email firstName lastName");
  res.json(records);
});

router.post("/verify/:id/approve", async (req, res) => {
  const record = await DoctorVerification.findById(req.params.id);
  if (!record) return res.status(404).json({ message: "Not found" });
  record.status = "approved";
  record.reviewedBy = req.user.id;
  await record.save();
  await User.findByIdAndUpdate(record.user, { isDoctorVerified: true });
  res.json({ message: "Doctor approved" });
});

router.post("/verify/:id/reject", async (req, res) => {
  const record = await DoctorVerification.findById(req.params.id);
  if (!record) return res.status(404).json({ message: "Not found" });
  record.status = "rejected";
  record.reviewedBy = req.user.id;
  await record.save();
  res.json({ message: "Doctor rejected" });
});

/* ── USER MANAGEMENT ── */
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const query = search
      ? { $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName:  { $regex: search, $options: "i" } },
          { email:     { $regex: search, $options: "i" } },
        ]}
      : {};
    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["regular", "doctor", "admin"].includes(role))
      return res.status(400).json({ message: "Invalid role" });
    if (req.params.id === String(req.user.id))
      return res.status(400).json({ message: "Cannot change your own role" });
    const user = await User.findByIdAndUpdate(
      req.params.id, { role }, { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Failed to update role" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    if (req.params.id === String(req.user.id))
      return res.status(400).json({ message: "Cannot delete your own account" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;