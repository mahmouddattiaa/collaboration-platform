const express = require("express");
const router = express.Router();
const geminiController = require("../controllers/geminiController");
const auth = require("../middleware/auth");

router.post("/generate", auth, geminiController.generateContent);
router.post("/chat", auth, geminiController.chatWithGemini);

module.exports = router;
