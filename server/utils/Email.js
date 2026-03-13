const nodemailer = require("nodemailer");

const createTransport = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,   // e.g. yourapp@gmail.com
      pass: process.env.EMAIL_PASS,   // Gmail App Password (not your real password)
    },
  });

/* ── Send verification email ── */
const sendVerificationEmail = async (toEmail, firstName, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"Health Hive" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your Health Hive account",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;">
        <div style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,.06);">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:linear-gradient(135deg,#2563eb,#4f46e5);border-radius:14px;margin-bottom:16px;">
              <span style="font-size:28px;">🏥</span>
            </div>
            <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0;">Welcome to Health Hive</h1>
            <p style="color:#64748b;margin:6px 0 0;">One step away, ${firstName}!</p>
          </div>
          <p style="color:#334155;line-height:1.7;margin:0 0 24px;">
            Thanks for signing up. Please verify your email address to activate your account and start connecting with doctors and the health community.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:.01em;">
              Verify Email Address
            </a>
          </div>
          <p style="color:#94a3b8;font-size:13px;text-align:center;margin:24px 0 0;">
            This link expires in <strong>24 hours</strong>. If you did not create an account, you can safely ignore this email.
          </p>
        </div>
        <p style="color:#cbd5e1;font-size:12px;text-align:center;margin-top:20px;">
          © 2025 Health Hive. All rights reserved.
        </p>
      </div>
    `,
  });
};

/* ── Send password reset email ── */
const sendPasswordResetEmail = async (toEmail, firstName, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"Health Hive" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your Health Hive password",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;">
        <div style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,.06);">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:14px;margin-bottom:16px;">
              <span style="font-size:28px;">🔐</span>
            </div>
            <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0;">Password Reset</h1>
            <p style="color:#64748b;margin:6px 0 0;">Hi ${firstName}, we got your request</p>
          </div>
          <p style="color:#334155;line-height:1.7;margin:0 0 24px;">
            Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:600;">
              Reset Password
            </a>
          </div>
          <p style="color:#94a3b8;font-size:13px;text-align:center;margin:24px 0 0;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <p style="color:#cbd5e1;font-size:12px;text-align:center;margin-top:20px;">
          © 2025 Health Hive. All rights reserved.
        </p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };