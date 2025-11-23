const { GoogleGenerativeAI } = require("@google/generative-ai");
const { BadRequestError } = require('../utils/errors');
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateContent = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      throw new BadRequestError('Prompt is required');
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    next(error);
  }
};

exports.chatWithGemini = async (req, res, next) => {
  try {
    const { history, message } = req.body;
    if (!history || !message) {
      throw new BadRequestError('History and message are required');
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    next(error);
  }
};
