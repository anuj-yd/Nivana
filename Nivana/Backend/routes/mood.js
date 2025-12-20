const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

const Mood = mongoose.model("Mood");
const User = mongoose.model("User");

// Helper: date ko sirf YYYY-MM-DD level par compare karne ke liye
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// POST /api/moods
router.post("/", auth, async (req, res) => {
  try {
    console.log("REQ.USER 👉", req.user);
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const { mood, score, date } = req.body;
    const moodScore = Number(score);

    // Basic validation
    if (!mood || isNaN(moodScore)) {
      return res.status(400).json({ msg: "Mood and valid score are required" });
    }

    /* -------------------- 1️⃣ SAVE MOOD -------------------- */
    const moodEntry = new Mood({
      userId,
      mood,
      score: moodScore,
      createdAt: date || new Date(),
    });

    await moodEntry.save();

    /* -------------------- 2️⃣ STREAK UPDATE -------------------- */
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Initialize streak if missing
    if (!user.streak) {
      user.streak = { current: 0, longest: 0, badges: [] };
    }
    if (!user.streak.badges) {
      user.streak.badges = [];
    }

    const today = normalizeDate(new Date());
    const lastDate = user.lastLoginDate
      ? normalizeDate(user.lastLoginDate)
      : null;

    // Same day → streak change nahi hogi
    if (!lastDate || today.getTime() !== lastDate.getTime()) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      if (lastDate && lastDate.getTime() === yesterday.getTime()) {
        user.streak.current += 1;
      } else {
        user.streak.current = 1;
      }

      // Longest streak
      if (user.streak.current > user.streak.longest) {
        user.streak.longest = user.streak.current;
      }

      /* -------------------- 3️⃣ BADGES -------------------- */
      if (user.streak.current >= 7 && !user.streak.badges.includes("weekly")) {
        user.streak.badges.push("weekly");
      }

      if (user.streak.current >= 30 && !user.streak.badges.includes("monthly")) {
        user.streak.badges.push("monthly");
      }

      if (user.streak.current >= 365 && !user.streak.badges.includes("yearly")) {
        user.streak.badges.push("yearly");
      }

      user.lastLoginDate = today;
      user.markModified("streak");
      await user.save();
    }

    /* -------------------- 4️⃣ RESPONSE -------------------- */
    res.json({
      msg: "Mood saved successfully",
      mood: moodEntry,
      streak: user.streak,
    });

  } catch (err) {
    console.error("❌ Mood Save Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;