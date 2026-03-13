const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
{
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: ["reply", "like", "message", "doctor_verified", "bookmark"],
    required: true,
  },
  message:      { type: String, required: true },
  link:         { type: String, default: "" },    // e.g. discussion ID to navigate to
  isRead:       { type: Boolean, default: false },
  discussionId: { type: mongoose.Schema.Types.ObjectId, ref: "Discussion" },
},
{ timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);