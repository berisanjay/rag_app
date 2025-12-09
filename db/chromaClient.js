const { ChromaClient } = require("chromadb");

const chroma = new ChromaClient({
  path: "./chroma", // will store locally
});

module.exports = chroma;