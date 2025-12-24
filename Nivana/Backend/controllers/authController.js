const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // Built-in module
const nodemailer = require("nodemailer"); // Email sender
const User = require("../models/User");

// --- LOGIN ---
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
      { id: user._id, userId: user.userId },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        _id: user._id,
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage, 
        createdAt: user.createdAt
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// --- SIGNUP ---
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ msg: "User exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hash, provider: "local" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// --- GET ME ---
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// --- UPDATE PROFILE ---
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const allowedUpdates = [
      'fullName', 'bio', 'location', 'wellnessFocus', 
      'emergencyName', 'emergencyPhone', 'reminderPreference'
    ];

    const actualUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        actualUpdates[key] = updates[key];
      }
    });

    if (req.file) {
      actualUpdates.profileImage = `/uploads/profile_images/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(userId, actualUpdates, { 
      new: true, 
      runValidators: true 
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, msg: "Server error updating profile" });
  }
};

// --- ✅ FIXED: FORGOT PASSWORD (RENDER FRIENDLY) ---
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  let user; 

  try {
    user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Reset Token Generate
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash karke DB me save (Security)
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

    await user.save();

    // Reset URL Logic
    // IMP: Render Env Vars me CLIENT_URL = https://nivana.vercel.app zaroor set karein
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientURL}/reset-password/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    // ✅ FIXED: Email Config for Render
    const transporter = nodemailer.createTransport({
      service: "gmail", // Small 'g' is standard
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // App Password (without spaces)
      },
    });

    await transporter.sendMail({
      to: user.email,
      from: `"Nivana Support" <${process.env.EMAIL_USER}>`, // Sender Name Add kiya
      subject: "Password Reset Request - NIVANA",
      html: message,
    });

    res.status(200).json({ success: true, data: "Email Sent" });

  } catch (err) {
    console.error("Email Error:", err);
    
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false }); 
    }
    
    res.status(500).json({ msg: "Email could not be sent" });
  }
};

// --- RESET PASSWORD ---
exports.resetPassword = async (req, res) => {
  // URL se token le kar hash match karein
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or Expired Token" });
    }

    // Naya Password Hash karein
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // Tokens clear karein
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({ success: true, data: "Password Updated Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};