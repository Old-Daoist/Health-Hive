const mongoose = require("mongoose");

const doctorVerificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    qualification: {
      type: String,
      required: true
    },

    registrationNumber: {
      type: String,
      required: true
    },

    country: {
      type: String,
      required: true
    },

    documentUrl: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoctorVerification", doctorVerificationSchema);
