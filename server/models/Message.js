const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // Conversation room key: sorted pair of user IDs
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Helper to build a deterministic conversation ID from two user IDs
messageSchema.statics.buildConversationId = function (userA, userB) {
  return [userA.toString(), userB.toString()].sort().join("_");
};

module.exports = mongoose.model("Message", messageSchema);
