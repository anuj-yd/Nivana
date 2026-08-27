const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { 
  login, 
  signup, 
  getMe, 
  updateProfile, 
  forgotPassword, 
  resetPassword   
} = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");

// Env variables load (Just in case)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// --- Standard Routes ---
router.post("/login", login);
router.post("/signup", signup);
router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, upload.single('profileImage'), updateProfile);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

// --- Google OAuth Routes ---
// 1. Google Login Button Hit
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// 2. Google Callback (Wapas aana)
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/login`, session: false }),
  (req, res) => {
    // Token Generate
    const token = jwt.sign(
      { id: req.user._id, userId: req.user.userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // Redirect with Token
    res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
  }
);



module.exports = router;