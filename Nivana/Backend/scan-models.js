// Backend/scan-models.js file mein
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTry = [
  "gemini-2.5-flash", // Sabse naya (try karein)
  "gemini-1.5-flash",
  "gemini-pro",
  "gemini-1.0-pro",
  "text-bison",       // Bada, legacy model
  "text-bison-001",   // Legacy model
  "embedding-001"     // Ek dum basic model (agar ye chala toh code chalega)
];

async function scan() {
  console.log("🔍 Scanning for available models...\n");

  for (const modelName of modelsToTry) {
    try {
      process.stdout.write(`👉 Testing '${modelName}'... `);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello, just checking connection.");
      const response = await result.response;
      
      if (response && response.text) {
        console.log("✅ WORKING!");
        console.log(`\n🎉 SUCCESSS! Use this model name in your code: "${modelName}"\n`);
        return; // Pehla working model milte hi ruk jao
      }
    } catch (error) {
      if (error.message.includes("404") || error.message.includes("not found")) {
        console.log("❌ Not Found (404)");
      } else {
        console.log(`❌ Error: ${error.message}`);
      }
    }
  }
  console.log("\n❌ No working models found. Please contact Google Support.");
}

scan();