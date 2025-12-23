const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Mood = require("../models/Mood");
const Assessment = require("../models/Assessment");

// Helper function to get the start of the week (Sunday)
const getStartOfWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay()); // Go to Sunday
    d.setHours(0, 0, 0, 0);
    return d;
};

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. USER/STREAK DATA FETCH (No Update here)
    const user = await User.findById(userId).select('fullName streak');
    if (!user) return res.status(404).json({ msg: "User not found" });

    // 2. MOOD DATA FETCH
    // Weekly mood fetch करने के लिए startOfWeek का उपयोग करें
    const startOfWeek = getStartOfWeek();

    // Mood model में 'userId' Key का उपयोग करना
    const moodHistory = await Mood.find({ 
        userId: userId, 
        createdAt: { $gte: startOfWeek } 
    }).sort({ createdAt: 1 }); // पुराने से नए क्रम में

    // Graph format में convert करें
    const weeklyMood = moodHistory.map((m) => ({
      day: new Date(m.createdAt).toLocaleDateString("en-US", { weekday: "short" }),
      score: m.score,
    }));

    // 3. LATEST ASSESSMENT FETCH
    // Assessment model में 'user' Key का उपयोग करना
    let latestAssessment = await Assessment.findOne({ user: userId }).sort({ createdAt: -1 });

    // DEBUG LOG
    console.log(`✅ Dashboard Data Loaded for ${user.fullName}. Streak: ${user.streak?.current || 0}`);

    res.json({
      streak: user.streak || { current: 0, longest: 0, badges: [] }, // Existing Streak Data
      weeklyMood,
      latestAssessment: latestAssessment || {}
    });

  } catch (err) {
    console.error("CRITICAL: Dashboard Fetch Error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;