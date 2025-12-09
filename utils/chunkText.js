function chunkText(text, chunkSize = 100) {
  const words = text.split(/\s+/); // Split by whitespace
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    chunks.push(chunk);
  }

  return chunks;
}