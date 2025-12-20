const mongoose = require("mongoose");

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

    /* ✅ FLEXIBLE ANSWERS 
      Humne isse strict Schema se hata kar Array bana diya.
      Taaki agar AI questions format badal bhi de, toh bhi save ho jaye.
    */
    answers: {
      type: Array, 
      required: true,
    },

    /* -------- DASHBOARD QUICK FIELDS -------- */
    mood: { type: Number, default: null },       // 1–5 scale
    sleep: { type: Number, default: null },      // 1–5 scale
    stress: { type: Number, default: null },     // 1–5 scale
    moodScore: { type: Number, default: null },  // 1–10 scale
    
    severity: {
      type: String,
      enum: ["low", "medium", "high", "severe", "Low", "Moderate", "High", "Severe", null], // Case sensitive fix
      default: null,
    },

    /* -------- FLAGS -------- */
    highRisk: { type: Boolean, default: false },
    suicidal: { type: Boolean, default: false },
    needsReview: { type: Boolean, default: false },
    emergency: { type: Boolean, default: false }, // Critical Flag

    /* 🔥 FLEXIBLE ANALYSIS STORAGE (Sabse Important Fix)
       Humne isse 'LlmSchema' se hata kar seedha 'Object' kar diya.
       Isse ye fayda hoga:
       1. Agar Google AI ka format thoda change ho -> Save ho jayega.
       2. Agar Backup Logic (Manual Math) chale -> Save ho jayega.
       3. "Validation Error" kabhi nahi aayega.
    */
    llmAnalysis: {
      type: Object, 
      default: {}
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

module.exports = mongoose.model("Assessment", AssessmentSchema);