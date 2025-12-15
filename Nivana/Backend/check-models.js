// check-models.js (Backend folder mein banayein)
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // Model fetch karne ki koshish (Hidden feature test)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hi");
    console.log("✅ 'gemini-pro' is WORKING!");
  } catch (error) {
    console.log("❌ 'gemini-pro' failed:", error.message);
  }
}

listModels();