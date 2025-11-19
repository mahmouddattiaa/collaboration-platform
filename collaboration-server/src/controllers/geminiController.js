const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ message: "Error generating content from Gemini" });
  }
};

exports.chatWithGemini = async (req, res) => {
  try {
    const { history, message } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro" });
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 100,
      },
    });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    console.error("Error in Gemini chat:", error);
    res.status(500).json({ message: "Error in Gemini chat" });
  }
};
