
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Assessment = require("../models/Assessment");
const User = require("../models/User"); 
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 🔥 NEW: Import Recommendation Engine
const { getRecommendations } = require("../utils/recommendationEngine"); 

// Helper: JSON Clean
const cleanJSON = (text) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

// Helper: Delay function for Retry
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Robust AI Generation with Retry Logic
async function generateWithRetry(model, prompt, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return cleanJSON(response.text());
        } catch (err) {
            // Sirf 503 (Overloaded) error par retry karein
            if (err.status === 503 || err.message?.includes("overloaded")) {
                console.warn(`⚠️ AI Overloaded (Attempt ${i + 1}/${retries}). Retrying in 2s...`);
                await delay(2000); // 2 second wait
            } else {
                throw err; // Koi aur error ho toh turant bata do
            }
        }
    }
    throw new Error("AI Service Unavailable after retries");
}

// ---------------------------------------------------------
// 1. START ASSESSMENT
// ---------------------------------------------------------
router.post("/start", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ msg: "Server Error: API Key missing" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    let text;
    try {
        // ✅ Try creating questions with AI
        text = await generateWithRetry(model, prompt);
    } catch (aiError) {
        console.error("❌ AI Failed completely. Using Backup Questions.");
        text = null;
    }

    let questions = [];
    if (text) {
        try {
            questions = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error, using backup.");
            text = null; 
        }
    }

    // 🛡️ FALLBACK QUESTIONS
    if (!text || !questions.length) {
        questions = [
            { id: "fb_1", category: "anxiety", type: "scale4", title: "Feeling nervous, anxious, or on edge?" },
            { id: "fb_2", category: "anxiety", type: "scale4", title: "Not being able to stop or control worrying?" },
            { id: "fb_3", category: "anxiety", type: "scale4", title: "Worrying too much about different things?" },
            { id: "fb_4", category: "anxiety", type: "scale4", title: "Trouble relaxing?" },
            { id: "fb_5", category: "mood", type: "scale4", title: "Little interest or pleasure in doing things?" },
            { id: "fb_6", category: "mood", type: "scale4", title: "Feeling down, depressed, or hopeless?" },
            { id: "fb_7", category: "mood", type: "scale4", title: "Feeling bad about yourself - or that you are a failure?" },
            { id: "fb_8", category: "mood", type: "scale4", title: "Feeling overwhelmed by daily tasks?" },
            { id: "fb_9", category: "sleep", type: "scale4", title: "Trouble falling or staying asleep?" },
            { id: "fb_10", category: "sleep", type: "scale4", title: "Sleeping too much?" },
            { id: "fb_11", category: "sleep", type: "scale4", title: "Feeling tired or having little energy?" },
            { id: "fb_12", category: "sleep", type: "scale4", title: "Poor appetite or overeating?" },
            { id: "fb_13", category: "focus", type: "scale4", title: "Trouble concentrating on things, such as reading or work?" },
            { id: "fb_14", category: "focus", type: "scale4", title: "Moving or speaking so slowly that other people could have noticed?" },
            { id: "fb_15", category: "focus", type: "scale4", title: "Being so fidgety or restless that you have been moving around a lot?" },
            { id: "fb_16", category: "focus", type: "scale4", title: "Brain fog or difficulty making decisions?" },
            { id: "fb_17", category: "social", type: "scale4", title: "Feeling isolated or lonely?" },
            { id: "fb_18", category: "social", type: "scale4", title: "Withdrawing from friends and family?" },
            { id: "fb_19", category: "social", type: "scale4", title: "Feeling irritable or annoyed with others?" },
            { id: "fb_20", category: "social", type: "scale4", title: "Has your mood affected your relationships or work?" }
        ];
    }

    res.json({ questions });

  } catch (err) {
    console.error("Critical Server Error:", err);
    res.status(500).json({ msg: "Server Error", questions: [] });
  }
});

// ---------------------------------------------------------
// 2. SUBMIT ASSESSMENT (Updated with Recommendation Engine)
// ---------------------------------------------------------
router.post("/submit", auth, async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { age, answers } = req.body;

    // --- AI ANALYSIS WITH RETRY ---
    let analysisData = {};
    
    try {
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

        const text = await generateWithRetry(model, analysisPrompt);
        analysisData = JSON.parse(text);

    } catch (aiErr) {
        console.error("❌ AI Analysis Failed. Switching to Manual Calculation.");
        
        // 🛡️ FALLBACK: Manual Logic
        let totalScore = 0;
        let count = 0;
        
        if (Array.isArray(answers)) {
            answers.forEach(a => {
                if (typeof a.value === 'number') {
                    totalScore += a.value;
                    count++;
                }
            });
        }
        
        const avg = count > 0 ? (totalScore / count) : 0;
        const normalizedScore = Math.round((avg / 5) * 100); 
        
        let risk = "Low";
        if (normalizedScore > 40) risk = "Moderate";
        if (normalizedScore > 70) risk = "High";

        analysisData = { 
            summary: "AI service was busy. This is a preliminary automated score.", 
            riskLevel: risk, 
            scores: { 
                anxiety: normalizedScore, 
                depression: normalizedScore, 
                sleep: normalizedScore, 
                focus: normalizedScore, 
                social: normalizedScore 
            },
            emergency: false,
            guidance: "We recommend consulting a mental health professional for a detailed evaluation."
        };
    }

    // --- 🔥 INTEGRATE RECOMMENDATION ENGINE START 🔥 ---
    
    // 1. Fetch User History (Last 3 assessments)
    const history = await Assessment.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(3);

    // 2. Prepare Data for Engine
    // (Hum AI analysis se data nikal rahe hain, agar AI fail hua toh fallback values use hongi)
    const currentDataForEngine = {
        severity: analysisData.riskLevel,       // Low, Moderate, High, Severe
        moodScore: analysisData.scores?.depression || 50,
        suicidal: analysisData.emergency || false,
        // Specific checks based on answers
        sleep: analysisData.scores?.sleep || 0,
        stress: analysisData.scores?.anxiety || 0
    };

    // 3. Generate Recommendations
    const { actions, guidance } = getRecommendations(
        currentDataForEngine, 
        history, 
        answers.map(a => a.value) // Pass raw answers just in case
    );

    // --- INTEGRATION END ---


    // --- SAVE TO DB ---
    const newAssessment = new Assessment({
      user: req.user.id,
      age,
      answers,
      llmAnalysis: analysisData,
      emergency: analysisData.emergency || false,
      
      // 🔥 Saving Generated Recommendations
      recommendedActions: actions,
      guidanceNote: guidance // Overwriting AI guidance with our Smart Engine guidance (optional)
    });

    await newAssessment.save();

    // --- UPDATE STREAK ---
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            const today = new Date();
            const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : new Date(0);
            
            if (today.toDateString() !== lastLogin.toDateString()) {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastLogin.toDateString() === yesterday.toDateString()) {
                    user.streak.current = (user.streak.current || 0) + 1;
                } else {
                    user.streak.current = 1;
                }

                user.lastLoginDate = today;
                if (user.streak.current > (user.streak.longest || 0)) {
                    user.streak.longest = user.streak.current;
                }
                user.markModified('streak');
                await user.save();
            }
        }
    } catch (streakErr) {
        console.error("Streak Update Error (Non-fatal):", streakErr);
    }

    res.json({ 
      msg: "Assessment Saved", 
      assessment: newAssessment,
      emergency: analysisData.emergency 
    });

  } catch (err) {
    console.error("Submission Error:", err);
    res.status(500).json({ msg: "Server Error during submission" });
  }
});

// History Routes
router.get("/history", auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(assessments);
  } catch (err) { res.status(500).send("Server Error"); }
});

// 🔥 GET LATEST ASSESSMENT FOR GUIDANCE PAGE
router.get("/latest", auth, async (req, res) => {
  try {
    // Sabse latest record dhoondo
    const assessment = await Assessment.findOne({ user: req.user.id })
        .sort({ createdAt: -1 });
    
    // Frontend ko data bhejo (recommendedActions isme included honge)
    res.json(assessment || {});
  } catch (err) { res.status(500).send("Server Error"); }
});

module.exports = router;