const express = require("express");
const Reply = require("../models/Reply");
const {
  requireAuth,
  requireDoctor,
  requireVerifiedDoctor
} = require("../middleware/auth.middleware");

const router = express.Router();

/* DOCTOR REPLY */
router.post(
  "/:discussionId",
  requireAuth,
  requireDoctor,
  requireVerifiedDoctor,
  async (req, res) => {
    try {
      const reply = await Reply.create({
        discussion: req.params.discussionId,
        doctor: req.user.id,
        content: req.body.content
      });

      res.status(201).json(reply);
    } catch {
      res.status(500).json({ message: "Reply failed" });
    }
  }
);

module.exports = router;
