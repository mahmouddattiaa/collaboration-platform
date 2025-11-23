const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const apiKey = process.env.GEMINI_API_KEY;

console.log("Testing Gemini API Key...");

async function listModels() {
  try {
    if (!apiKey) throw new Error("No API key found");
    // Use global fetch (Node 18+)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
        console.error("API Error:", data.error);
        return;
    }
    
    console.log("Available Models:");
    data.models?.forEach(m => console.log(`- ${m.name} (${m.version})`));
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

listModels();