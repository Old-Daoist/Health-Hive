const express = require("express");
const Message = require("../models/Message");
const User    = require("../models/User");
const { requireAuth } = require("../middleware/auth.middleware");
const { createNotification } = require("./notification.routes");

const router = express.Router();

/* ===========================
   GET ALL CONVERSATIONS
=========================== */
router.get("/conversations", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id.toString();

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender",   "firstName lastName role isDoctorVerified")
      .populate("receiver", "firstName lastName role isDoctorVerified");

    const seen = new Set();
    const conversations = [];

    for (const msg of messages) {
      if (!seen.has(msg.conversationId)) {
        seen.add(msg.conversationId);

        const senderIdStr   = msg.sender?._id?.toString();
        const receiverIdStr = msg.receiver?._id?.toString();
        if (!senderIdStr || !receiverIdStr) continue;

        const other = senderIdStr === userId ? msg.receiver : msg.sender;
        if (other._id.toString() === userId) continue;

        const unread = await Message.countDocuments({
          conversationId: msg.conversationId,
          sender:   other._id,
          receiver: userId,
          read: false,
        });

        conversations.push({
          conversationId: msg.conversationId,
          other,
          lastMessage: {
            content:   msg.content,
            createdAt: msg.createdAt,
            fromMe:    senderIdStr === userId,
          },
          unread,
        });
      }
    }

    res.json({ success: true, conversations });
  } catch (err) {
    console.error("Get conversations error:", err.message);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
});

/* ===========================
   GET USERS (new conversation)
=========================== */
router.get("/users", requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    const filter = { _id: { $ne: req.user.id.toString() } };
    if (q) {
      filter.$or = [
        { firstName: { $regex: q, $options: "i" } },
        { lastName:  { $regex: q, $options: "i" } },
      ];
    }
    const users = await User.find(filter)
      .select("firstName lastName role isDoctorVerified")
      .limit(20);
    res.json({ success: true, users });
  } catch (err) {
    console.error("Get users error:", err.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ===========================
   GET MESSAGES IN CONVERSATION
=========================== */
router.get("/:otherUserId", requireAuth, async (req, res) => {
  try {
    const conversationId = Message.buildConversationId(
      req.user.id,
      req.params.otherUserId
    );

    const messages = await Message.find({ conversationId })
      .populate("sender", "firstName lastName role isDoctorVerified")
      .sort({ createdAt: 1 });

    // Mark incoming messages as read
    await Message.updateMany(
      { conversationId, receiver: req.user.id, read: false },
      { read: true }
    );

    res.json({ success: true, messages });
  } catch (err) {
    console.error("Get messages error:", err.message);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

/* ===========================
   SEND A MESSAGE
=========================== */
router.post("/:otherUserId", requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    const senderId   = req.user.id.toString();
    const receiverId = req.params.otherUserId;

    if (!content || !content.trim())
      return res.status(400).json({ message: "Message content is required" });

    if (senderId === receiverId)
      return res.status(400).json({ message: "You cannot message yourself" });

    const receiver = await User.findById(receiverId);
    if (!receiver)
      return res.status(404).json({ message: "User not found" });

    const conversationId = Message.buildConversationId(senderId, receiverId);

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      conversationId,
    });

    const populated = await Message.findById(message._id)
      .populate("sender",   "firstName lastName role isDoctorVerified")
      .populate("receiver", "firstName lastName role isDoctorVerified");

    // Real-time: emit to both users
    const io = global.io;
    if (io) {
      io.to(senderId).emit("newMessage", populated);
      io.to(receiverId).emit("newMessage", populated);
    }

    // Notification to receiver
    const senderName = `${req.user.name || `${populated.sender.firstName} ${populated.sender.lastName}`}`;
    createNotification({
      recipient: receiverId,
      sender:    senderId,
      type:      "message",
      message:   `${senderName} sent you a message`,
    }).catch(console.error);

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    console.error("Send message error:", err.message);
    res.status(500).json({ message: "Failed to send message" });
  }
});

module.exports = router;