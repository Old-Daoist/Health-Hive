const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  userType: { type: String, enum: ["regular", "doctor", "admin"] }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);

