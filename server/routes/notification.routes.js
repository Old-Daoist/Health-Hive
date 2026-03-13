const express = require("express");
const Notification = require("../models/Notification");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

/* GET /api/notifications — fetch latest 30 for current user */
router.get("/", requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("sender", "firstName lastName role");

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

/* PATCH /api/notifications/:id/read — mark one as read */
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true }
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification" });
  }
});

/* PATCH /api/notifications/read-all — mark all as read */
router.patch("/read-all", requireAuth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

/* DELETE /api/notifications/:id — delete one */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
});

/* Helper exported so other routes can create + push notifications */
const createNotification = async ({ recipient, sender, type, message, link, discussionId }) => {
  if (!recipient || recipient.toString() === sender?.toString()) return;
  try {
    const notif = await Notification.create({ recipient, sender, type, message, link, discussionId });
    const populated = await notif.populate("sender", "firstName lastName role");

    // Push via socket to the recipient's personal room
    if (global.io) {
      global.io.to(recipient.toString()).emit("newNotification", populated);
    }
  } catch (err) {
    console.error("Notification creation failed:", err.message);
  }
};

module.exports = router;
module.exports.createNotification = createNotification;