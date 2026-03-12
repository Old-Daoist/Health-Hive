const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  firstName: {
    type: String,
    required: true,
    trim: true,
  },

  lastName: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  role: {
    type: String,
    enum: ["regular", "doctor", "admin"],
    default: "regular",
  },

  isDoctorVerified: {
    type: Boolean,
    default: false,
  },

  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
    },
  ],

},
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
}
);

/* Virtual full name */

userSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", userSchema);