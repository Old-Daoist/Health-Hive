const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/jwt");
const { requireAuth } = require("../middleware/auth.middleware");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/Email");

let rateLimit;
try { rateLimit = require("express-rate-limit"); } catch { rateLimit = null; }

const router = express.Router();

/* ── Rate limiters ── */
const makeRateLimit = (max, windowMins, msg) => {
  if (!rateLimit) return (req, res, next) => next();
  return rateLimit({ windowMs: windowMins * 60 * 1000, max, message: { message: msg }, standardHeaders: true, legacyHeaders: false });
};

const authLimiter  = makeRateLimit(10,  15, "Too many attempts. Try again in 15 minutes.");
const emailLimiter = makeRateLimit(5,   60, "Too many requests. Try again in 1 hour.");

/* ── Helpers ── */
const userPayload = (u) => ({
  id: u._id,
  firstName: u.firstName,
  lastName: u.lastName,
  name: `${u.firstName} ${u.lastName}`,
  email: u.email,
  role: u.role,
  isDoctorVerified: u.isDoctorVerified,
  isEmailVerified: u.isEmailVerified,
  bio: u.bio,
  phone: u.phone,
  city: u.city,
  country: u.country,
  specialization: u.specialization,
});

/* ========================= SIGNUP ========================= */
router.post("/signup", authLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, password, userType, role: roleField } = req.body;

    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 12);
    const raw    = roleField || userType || "regular";
    const role   = raw === "user" ? "regular" : raw;

    const verifyToken  = crypto.randomBytes(32).toString("hex");
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await User.create({
      firstName, lastName, email, password: hashed, role,
      emailVerificationToken: verifyToken,
      emailVerificationExpiry: verifyExpiry,
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, firstName, verifyToken).catch(console.error);

    res.status(201).json({
      token: generateToken(newUser),
      user: userPayload(newUser),
      message: "Account created! Please check your email to verify your account.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

/* ========================= LOGIN ========================= */
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ token: generateToken(user), user: userPayload(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

/* ========================= GET /me ========================= */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(userPayload(user));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

/* ========================= UPDATE PROFILE ========================= */
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, bio, phone, city, country, specialization } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, bio, phone, city, country, specialization },
      { new: true }
    );
    res.json(userPayload(user));
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

/* ========================= CHANGE PASSWORD ========================= */
router.put("/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password" });
  }
});

/* ========================= VERIFY EMAIL ========================= */
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token is required" });

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationExpiry");

    if (!user) return res.status(400).json({ message: "Invalid or expired verification link" });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});

/* ========================= RESEND VERIFICATION ========================= */
router.post("/resend-verification", emailLimiter, requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+emailVerificationToken +emailVerificationExpiry");
    if (user.isEmailVerified) return res.status(400).json({ message: "Email already verified" });

    const verifyToken  = crypto.randomBytes(32).toString("hex");
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.emailVerificationToken  = verifyToken;
    user.emailVerificationExpiry = verifyExpiry;
    await user.save();

    await sendVerificationEmail(user.email, user.firstName, verifyToken);
    res.json({ message: "Verification email sent!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send email" });
  }
});

/* ========================= FORGOT PASSWORD ========================= */
router.post("/forgot-password", emailLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    // Always return the same message — don't reveal whether email exists
    const user = await User.findOne({ email });
    if (user) {
      const resetToken  = crypto.randomBytes(32).toString("hex");
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      user.passwordResetToken  = resetToken;
      user.passwordResetExpiry = resetExpiry;
      await user.save();
      sendPasswordResetEmail(email, user.firstName, resetToken).catch(console.error);
    }
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    res.status(500).json({ message: "Failed to process request" });
  }
});

/* ========================= RESET PASSWORD ========================= */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Token and new password are required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpiry");

    if (!user) return res.status(400).json({ message: "Invalid or expired reset link" });

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken  = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully! You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed" });
  }
});

module.exports = router;