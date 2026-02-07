const express = require("express");
const DoctorVerification = require("../models/DoctorVerification");
const { requireAuth, requireDoctor } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

/* SUBMIT VERIFICATION */
router.post(
  "/verify",
  requireAuth,
  requireDoctor,
  upload.single("document"),
  async (req, res) => {
    try {
      const exists = await DoctorVerification.findOne({ user: req.user.id });
      if (exists) {
        return res.status(400).json({ message: "Already submitted" });
      }

      const record = await DoctorVerification.create({
        user: req.user.id,
        qualification: req.body.qualification,
        registrationNumber: req.body.registrationNumber,
        country: req.body.country,
        documentUrl: req.file.path
      });

      res.status(201).json(record);
    } catch {
      res.status(500).json({ message: "Verification failed" });
    }
  }
);

module.exports = router;
