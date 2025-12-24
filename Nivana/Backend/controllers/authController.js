const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const User = require("../models/User");

// ✅ Resend instance (SAFE)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/* ======================
   LOGIN
====================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.provider !== "local") {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ======================
   SIGNUP
====================== */
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hash,
      provider: "local",
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ======================
   GET ME
====================== */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

/* ======================
   UPDATE PROFILE
====================== */
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      "fullName",
      "bio",
      "location",
      "wellnessFocus",
      "emergencyName",
      "emergencyPhone",
      "reminderPreference",
    ];

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (req.file) {
      updates.profileImage = `/uploads/profile_images/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ======================
   FORGOT PASSWORD
   ✅ RESEND FIRST (SAFE)
   ✅ GMAIL FALLBACK (LOCAL)
====================== */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  let user;

  try {
    user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 🔐 Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientURL}/reset-password/${resetToken}`;

    const html = `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

    /* ======================
       EMAIL SEND LOGIC
    ====================== */

    // ✅ USE RESEND (WORKS ON RENDER, NO DOMAIN NEEDED)
    if (resend) {
      await resend.emails.send({
        from: "NIVANA <onboarding@resend.dev>",
        to: user.email,
        subject: "Password Reset - NIVANA",
        html,
      });
    }

    // ✅ FALLBACK → GMAIL (LOCAL ONLY)
    else {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        to: user.email,
        subject: "Password Reset - NIVANA",
        html,
      });
    }

    res.json({ success: true, msg: "Reset link sent" });
  } catch (err) {
    console.error("Forgot password error:", err);

    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.status(500).json({ msg: "Email could not be sent" });
  }
};

/* ======================
   RESET PASSWORD
====================== */
exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ success: true, msg: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
