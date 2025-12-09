const express = require('express');
const router = express.Router();
const askGemini = require('../utils/geminiAsk');
const fs = require('fs');

router.post('/', async (req, res) => {
  const question = req.body.question;
  console.log("Question received:", question);

  if (!question) {
    return res.status(400).json({ error: 'No question provided.' });
  }

  // ✅ Load extracted chunks from JSON
  const chunks = JSON.parse(fs.readFileSync('extractedChunks.json', 'utf8'));

  // ✅ Simulate filtering (you can improve this with vector distance logic later)
  const context = chunks.slice(0, 3).join('\n\n');

  const prompt = `
You are a helpful assistant. Use ONLY the following context to answer.

Context:
${context}

Question: ${question}

If the answer is not present in the context, reply: "I don't know."
`;

  try {
    const answer = await askGemini(prompt);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to query Gemini." });
  }
});

module.exports = router;
