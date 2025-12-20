
const { generateQuestionsWithGemini, analyzeAssessmentWithGemini } = require('../services/gemini');
const { defaultQuestions } = require('../utils/staticQuestions');
const { getRecommendations } = require('../utils/recommendationEngine'); // 🔥 IMPORT RULE ENGINE
const Assessment = require('../models/Assessment');

// -----------------------------------------------
// 1) START ASSESSMENT
// -----------------------------------------------
exports.startAssessment = async (req, res) => {
  try {
    const age = Number(req.body.age);
    const maxQuestions = Number(req.body.maxQuestions || process.env.MAX_QUESTIONS || 35);
    const includeValidated = req.body.includeValidated === true || (process.env.INCLUDE_VALIDATED === 'true');

    if (!Number.isFinite(age)) {
      return res.status(400).json({ msg: 'age required as number' });
    }

    if (process.env.USE_GEMINI_FOR_QUESTIONS === 'true') {
      try {
        const gen = await generateQuestionsWithGemini({ age, maxQuestions, includeValidated });
        if (gen.questions && gen.questions.length >= 1) {
          if (includeValidated) {
            const hasPhq = gen.questions.some(q => /^phq\d+$/i.test(q.id));
            const hasGad = gen.questions.some(q => /^gad\d+$/i.test(q.id));

            if (hasPhq && hasGad && gen.questions.length >= 16) {
              return res.json({ questions: gen.questions });
            }
          } else {
            return res.json({ questions: gen.questions });
          }
        }
      } catch (err) {
        console.warn("Gemini question error:", err.message);
      }
    }

    const fallback = defaultQuestions(age, maxQuestions);
    return res.json({ questions: fallback });

  } catch (err) {
    console.error("startAssessment error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// -----------------------------------------------
// 2) SUBMIT ASSESSMENT (SAVE TO DB + RECOMMENDATIONS)
// -----------------------------------------------
exports.submitAssessment = async (req, res) => {
  try {
    // 🔥 FIX: user must come from auth middleware
    if (!req.user?.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const { age, answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ msg: "answers array required" });
    }

    const map = {};
    for (const a of answers) {
      if (a && a.questionId) {
        map[a.questionId.toLowerCase()] = Number(a.value || 0);
      }
    }

    // Dashboard values
    const mood = map["mood"] ?? null;
    const sleep = map["sleep"] ?? null;
    const stress = map["stress"] ?? null;
    const notes = answers.find(a => a.questionId === "notes")?.value || "";

    // PHQ-9
    let phq9Score = 0;
    for (let i = 1; i <= 9; i++) {
      const v = map[`phq${i}`];
      if (typeof v === "number") phq9Score += v;
    }

    // GAD-7
    let gad7Score = 0;
    for (let i = 1; i <= 7; i++) {
      const v = map[`gad${i}`];
      if (typeof v === "number") gad7Score += v;
    }

    // LLM analysis
    let analysis = {
      severity: null,
      risks: [],
      guidanceText: null,
      recommendClinicianReview: true
    };

    try {
      analysis = await analyzeAssessmentWithGemini({
        age: Number(age),
        answers: answers.slice(0, 2000),
        phq9Score,
        gad7Score
      });
    } catch (err) {
      console.warn("LLM analysis error:", err.message);
    }

    // --- 🔥 NEW STEP: RECOMMENDATION ENGINE LOGIC ---
    
    // 1. Fetch History (Last 3 assessments for Trend Analysis)
    const history = await Assessment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("mood severity score createdAt"); // Select relevant fields

    // 2. Prepare Current Data for Engine
    // (Ensure severity has a fallback if LLM failed)
    let derivedSeverity = analysis.severity;
    if (!derivedSeverity) {
        if (phq9Score >= 20) derivedSeverity = "Severe";
        else if (phq9Score >= 15) derivedSeverity = "High";
        else if (phq9Score >= 10) derivedSeverity = "Moderate";
        else derivedSeverity = "Low";
    }

    const currentDataForEngine = {
        severity: derivedSeverity,
        moodScore: mood, // Assuming questionId "mood" exists (1-10 or 1-5)
        sleep: sleep,
        stress: stress,
        suicidal: analysis.risks?.some(r => r.toLowerCase().includes('suicid') || r.toLowerCase().includes('self-harm')) || false
    };

    // 3. Generate Recommendations & Guidance
    const { actions, guidance } = getRecommendations(currentDataForEngine, history, answers.map(a => a.value));

    // -----------------------------------
    // SAVE TO DATABASE
    // -----------------------------------
    const record = await Assessment.create({
      user: req.user.id,           // ✅ REQUIRED FIELD (ObjectId)
      userId: req.user.userId,     // 🟢 optional numeric ID

      age: Number(age),

      answers,

      mood,
      sleep,
      stress,
      notes,

      phq9Score,
      gad7Score,

      llmAnalysis: analysis,
      
      // 🔥 Saving Generated Recommendations
      recommendedActions: actions,
      guidanceNote: guidance,
      severity: derivedSeverity, // Explicitly saving severity field

      createdAt: new Date()
    });

    return res.json({ 
        success: true,
        assessment: record,
        message: "Assessment saved and recommendations generated."
    });

  } catch (err) {
    console.error("submitAssessment error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// -----------------------------------------------
// 3) GET HISTORY
// -----------------------------------------------
exports.getHistory = async (req, res) => {
  try {
    const userObjectId = req.user?.id;

    if (!userObjectId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const rows = await Assessment.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()
      .exec();

    return res.json({ history: rows });

  } catch (err) {
    console.error("getHistory error", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// -----------------------------------------------
// 4) 🔥 GET LATEST ASSESSMENT (For Guidance Page)
// -----------------------------------------------
exports.getLatestAssessment = async (req, res) => {
    try {
      // User ID can come from URL params (if admin) or req.user (if logged in user)
      // Here assuming we use the ID from the route param for flexibility, 
      // but you should validate it matches req.user.id for security unless it's an admin.
      const userId = req.params.userId || req.user.id;
  
      const latestAssessment = await Assessment.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .select("recommendedActions guidanceNote severity mood createdAt"); // Fetch fields needed for Guidance UI
  
      if (!latestAssessment) {
        return res.status(200).json({ 
          success: true, 
          data: null, 
          message: "No assessments found yet." 
        });
      }
  
      return res.status(200).json({
        success: true,
        data: latestAssessment
      });
  
    } catch (error) {
      console.error("Error fetching latest assessment:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };