const express = require("express");
const router = express.Router();
const Mood = require("../models/Mood");
const User = require("../models/User"); // User Model Import
const auth = require("../middleware/auth"); 

// POST /api/moods - Save a new mood (with Streak Update)
router.post("/", auth, async (req, res) => {
  try {
    // 1. Authentication Check
    if (!req.user || !req.user.id) {
        console.error("Error: Authentication failed. req.user is missing ID.");
        return res.status(401).json({ msg: "Not authorized to log mood." });
    }

    const { mood, score, date } = req.body;
    
    // 💡 FIX: score ko Number mein convert karo
    const moodScore = Number(score);

    // 2. Validation
    if (!mood || typeof moodScore !== 'number' || isNaN(moodScore)) {
      return res.status(400).json({ msg: "Mood and score are required and must be valid." });
    }

    // 3. Save Mood
    const newMood = new Mood({
      userId: req.user.id,
      mood,
      score: moodScore, // ✅ Converted score use karo
      createdAt: date || Date.now(),
    });

    const savedMood = await newMood.save();
    
    // 4. Streak Update Logic (No change required here)
    try {
        const user = await User.findById(req.user.id);
        
        if (user) {
            const today = new Date();
            const todayDateOnly = today.toDateString();
            const lastLoginDateOnly = user.lastLoginDate ? new Date(user.lastLoginDate).toDateString() : '';
            
            if (todayDateOnly !== lastLoginDateOnly) {
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                const yesterdayDateOnly = yesterday.toDateString();
                
                if (lastLoginDateOnly !== yesterdayDateOnly) {
                    user.streak.current = 1;
                } else {
                    user.streak.current = (user.streak.current || 0) + 1;
                }

                user.lastLoginDate = today;
                
                if (user.streak.current > (user.streak.longest || 0)) {
                    user.streak.longest = user.streak.current;
                }
                user.markModified('streak');
                await user.save();
            }
        } else {
            console.warn("Mood Log: User not found for streak update.");
        }
    } catch (streakErr) {
        console.error("CRITICAL: Failed to update streak after saving mood:", streakErr.message);
    }
    
    res.json(savedMood);
  } catch (err) {
    console.error("CRITICAL: Failed to save mood to DB:", err.message);
    res.status(500).json({ msg: "Could not save mood: Check server logs for DB error." }); 
  }
});

module.exports = router;