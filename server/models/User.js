const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },

  role: { type: String, enum: ["regular", "doctor", "admin"], default: "regular" },
  isDoctorVerified: { type: Boolean, default: false },

  /* Email verification */
  isEmailVerified:         { type: Boolean, default: false },
  emailVerificationToken:  { type: String, select: false },
  emailVerificationExpiry: { type: Date,   select: false },

  /* Password reset */
  passwordResetToken:  { type: String, select: false },
  passwordResetExpiry: { type: Date,   select: false },

  /* Profile extras */
  bio:            { type: String, default: "" },
  phone:          { type: String, default: "" },
  city:           { type: String, default: "" },
  country:        { type: String, default: "" },
  specialization: { type: String, default: "" },

  avatar:  { type: String, default: "" },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Discussion" }],
},
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
}
);

userSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", userSchema);