// geminiAsk.js
const { VertexAI } = require('@google-cloud/vertexai');

const region = 'us-central1'; // Or the region you saw in Vertex AI Studio
const project = 'ragapp-465616'; // Replace with your actual GCP project ID

const vertexAI = new VertexAI({ project, location: region });
const model = vertexAI.preview.getGenerativeModel({
  model: 'gemini-2.5-flash', // Latest Gemini model
  generation_config: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
});

async function askGemini(promptText) {
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
  });

  return result.response.candidates?.[0]?.content?.parts?.[0]?.text || "❌ No response";
}

// Run if called directly (e.g., from terminal or ask.js)
if (require.main === module) {
  const userPrompt = process.argv[2] || "Who is Lord Krishna?";
  askGemini(userPrompt).then(console.log).catch(console.error);
}

module.exports = askGemini;
