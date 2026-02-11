const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const User = require("../models/User");

const router = express.Router();

/* ===========================
   REQUEST DOCTOR VERIFICATION
=========================== */
router.post("/verify-request", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        message: "Only doctors can request verification",
      });
    }

    // In real system you'd store credentials here
    res.json({
      success: true,
      message: "Verification request submitted",
    });

  } catch (error) {
    console.error("Doctor verify error:", error.message);
    res.status(500).json({ message: "Verification failed" });
  }
});

module.exports = router;
