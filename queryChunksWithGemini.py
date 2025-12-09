import chromadb
import json
import sys
import vertexai
from vertexai.generative_models import GenerativeModel
import os

# ✅ Set credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "vertex-key.json"

# ✅ Initialize Vertex AI
vertexai.init(project="ragapp-465616", location="us-central1")

# ✅ Get user question from command line
user_question = sys.argv[1] if len(sys.argv) > 1 else "Krishna"

# ✅ Query ChromaDB``
client = chromadb.PersistentClient(path="chroma_store")
collection = client.get_or_create_collection("my_collection")
results = collection.query(query_texts=[user_question], n_results=3)

chunks = results["documents"][0]
distances = results["distances"][0]

# ✅ Filter chunks by distance
filtered_chunks = [chunk for chunk, dist in zip(chunks, distances) if dist < 0.90]

# ✅ Exit if no good chunks found
if not filtered_chunks:
    print(json.dumps({ "answer": "❌ No relevant chunks found." }))
    sys.exit()

# ✅ Prepare context
context = "\n\n".join(filtered_chunks)

# ✅ Build clear prompt
prompt = f"""
You are a helpful assistant. Use ONLY the following context to answer.

Context:
{context}

Question: {user_question}

If the answer is not present in the context, reply: \"I don't know.\"
"""

# ✅ Call Gemini with selected model
model = GenerativeModel("gemini-2.5-flash")  # or gemini-1.5-pro if access available
response = model.generate_content(prompt)

# ✅ Print the response
print(json.dumps({ "answer": response.text }))