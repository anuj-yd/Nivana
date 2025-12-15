const mongoose = require("mongoose");

/* ---------------- ANSWERS ---------------- */
const AnswerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed }, // Number (0-5) or String (Text)
  },
  { _id: false }
);

/* ---------------- LLM ANALYSIS (Updated for High Accuracy) ---------------- */
const LlmSchema = new mongoose.Schema(
  {
    summary: String,        // AI ki 2-line summary
    riskLevel: String,      // Low, Moderate, High, Severe
    guidance: String,       // Actionable advice
    guidanceText: String,   // (Backward compatibility ke liye)
    risks: [String],        // Specific warnings
    recommendClinicianReview: Boolean,

    // ✅ NEW: 5 Pillars Scoring (0-100) - Dashboard Graph ke liye Zaroori
    scores: {
      anxiety: { type: Number, default: 0 },
      depression: { type: Number, default: 0 },
      sleep: { type: Number, default: 0 },
      focus: { type: Number, default: 0 },   // ADHD indicators
      social: { type: Number, default: 0 }
    }
  },
  { _id: false }
);

/* ---------------- MAIN ASSESSMENT SCHEMA ---------------- */
const AssessmentSchema = new mongoose.Schema(
  {
    /* 🔥 USER (Dashboard linkage) */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    age: { type: Number, required: true },

    /* Raw answers from Frontend */
    answers: [AnswerSchema],

    /* -------- DASHBOARD QUICK FIELDS -------- */
    // Ye fields dashboard ke quick view cards ke liye hain
    mood: { type: Number, default: null },       // 1–5 scale
    sleep: { type: Number, default: null },      // 1–5 scale
    stress: { type: Number, default: null },     // 1–5 scale
    moodScore: { type: Number, default: null },  // 1–10 scale
    
    severity: {
      type: String,
      enum: ["low", "medium", "high", "severe", null],
      default: null,
    },

    /* -------- CLINICAL SCORES (Standardized) -------- */
    phq9Score: { type: Number, default: null },
    phq9Severity: { type: String, default: null },

    gad7Score: { type: Number, default: null },
    gad7Severity: { type: String, default: null },

    /* -------- FLAGS -------- */
    highRisk: { type: Boolean, default: false },
    suicidal: { type: Boolean, default: false },
    needsReview: { type: Boolean, default: false },
    emergency: { type: Boolean, default: false }, // Critical Flag

    /* -------- AI ANALYSIS -------- */
    // Yahan detailed report save hogi
    llmAnalysis: LlmSchema,
  },
  {
    timestamps: true, // createdAt (Date) automatically add karega
  }
);

module.exports = mongoose.model("Assessment", AssessmentSchema);