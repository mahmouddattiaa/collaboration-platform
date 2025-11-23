const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const apiKey = process.env.GEMINI_API_KEY;

console.log("Testing Gemini API Key...");
console.log("Key present:", !!apiKey);
if (apiKey) console.log("Key prefix:", apiKey.substring(0, 5) + "...");

async function test() {
  try {
    if (!apiKey) throw new Error("No API key found in environment");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // List models
    /*
    const modelResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelData = await modelResponse.json();
    console.log("Available models:", modelData.models?.map(m => m.name));
    */

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = "Hello, are you working?";
    
    console.log(`Sending prompt: "${prompt}"`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Success! Response:", text);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
        console.error("Response details:", error.response);
    }
  }
}

test();