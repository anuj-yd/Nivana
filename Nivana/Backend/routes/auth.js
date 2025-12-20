const express = require("express");
const router = express.Router();
const passport = require("passport");
const { 
  login, 
  signup, 
  getMe, 
  updateProfile, 
  forgotPassword, // ✅ New Import
  resetPassword   // ✅ New Import
} = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");

// --- Standard Routes ---
router.post("/login", login);
router.post("/signup", signup);
router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, upload.single('profileImage'), updateProfile);

// --- ✅ Password Reset Routes ---
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

// --- Google OAuth Routes ---
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientURL}/dashboard`);
  }
);


// --- GitHub OAuth Routes ---
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"], // 🔥 YAHI FIX HAI
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientURL}/dashboard`);
  }
);


module.exports = router;