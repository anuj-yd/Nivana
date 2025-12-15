const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Assessment = require("../models/Assessment");
const User = require("../models/User"); 
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Helper: JSON Clean
const cleanJSON = (text) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

// ---------------------------------------------------------
// 1. START ASSESSMENT
// ---------------------------------------------------------
router.post("/start", async (req, res) => {
  try {
    // 🔍 DEBUG:
    console.log("🔍 API Key Check:", process.env.GEMINI_API_KEY ? "EXISTS ✅" : "MISSING ❌");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ msg: "Server Error: API Key missing" });
    }

    // ✅ Initialize INSIDE the route
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ✅ FIXED MODEL: 'gemini-2.5-flash' now used here
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const { age } = req.body;
    if (!age) return res.status(400).json({ msg: "Age is required" });

    const prompt = `
      Act as a clinical psychologist. Create a mental health assessment for a ${age}-year-old user.
      Generate exactly 20 QUESTIONS.
      Divide questions equally into these 5 pillars (4 questions each):
      1. Anxiety & Stress
      2. Mood & Emotional State
      3. Sleep & Physical Health
      4. Focus & Cognitive Function
      5. Social Connection & Environment
      Use 'scale4' type (0=Never to 5=Almost Daily).
      Return ONLY a JSON array.
      Format: [{ "id": "q1", "type": "scale4", "category": "anxiety", "title": "Question...", "hint": "..." }]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = cleanJSON(response.text());

    let questions = [];
    try {
      questions = JSON.parse(text);
    } catch (e) {
      console.error("JSON Error:", e);
      questions = [
        { id: "f1", type: "scale4", title: "How are you feeling overall?" },
        { id: "f2", type: "scale4", title: "Have you had trouble sleeping?" }
      ];
    }

    res.json({ questions });

  } catch (err) {
    console.error("Gemini Error:", err);
    // User ko friendly error bhejo, crash mat karo
    res.status(500).json({ 
        msg: "AI Service Unavailable", 
        fallback: true,
        questions: [
            { id: "err1", type: "scale4", title: "We are having trouble connecting to AI. How is your mood?" },
            { id: "err2", type: "scale4", title: "Please rate your stress level manually." }
        ]
    });
  }
});

// ---------------------------------------------------------
// 2. SUBMIT ASSESSMENT
// ---------------------------------------------------------
router.post("/submit", auth, async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // ✅ FIXED MODEL: 'gemini-2.5-flash' now used here
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const { age, answers } = req.body;

    const analysisPrompt = `
      Analyze this assessment for a ${age}-year-old.
      Answers: ${JSON.stringify(answers)}
      Output JSON only:
      1. "summary": (2 sentences)
      2. "riskLevel": "Low", "Moderate", "High", "Severe"
      3. "scores": { anxiety, depression, sleep, focus, social } (0-100)
      4. "emergency": boolean
      5. "guidance": Advice paragraph
    `;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = cleanJSON(response.text());
    
    let analysisData = {};
    try {
      analysisData = JSON.parse(text);
    } catch (e) {
      analysisData = { 
        summary: "Assessment complete.", 
        riskLevel: "Moderate", 
        scores: { anxiety: 50, depression: 50, sleep: 50, focus: 50, social: 50 },
        emergency: false,
        guidance: "Please consult a professional."
      };
    }

    const newAssessment = new Assessment({
      user: req.user.id,
      age,
      answers,
      llmAnalysis: analysisData,
      emergency: analysisData.emergency
    });

    await newAssessment.save();

    // UPDATE STREAK
    const user = await User.findById(req.user.id);
    if (user) {
        const today = new Date();
        const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : new Date(0);
        const isSameDay = today.toDateString() === lastLogin.toDateString();
        
        if (!isSameDay) {
            user.streak.current = (user.streak.current || 0) + 1;
            user.lastLoginDate = today;
            if (user.streak.current > (user.streak.longest || 0)) {
                user.streak.longest = user.streak.current;
            }
            user.markModified('streak');
            await user.save();
        }
    }

    res.json({ 
      msg: "Assessment Saved", 
      assessment: newAssessment,
      emergency: analysisData.emergency 
    });

  } catch (err) {
    console.error("Submission Error:", err);
    res.status(500).send("Server Error");
  }
});

// History Routes
router.get("/history", auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(assessments);
  } catch (err) { res.status(500).send("Server Error"); }
});

router.get("/latest", auth, async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(assessment || {});
  } catch (err) { res.status(500).send("Server Error"); }
});

module.exports = router;