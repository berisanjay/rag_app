import chromadb
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')


try:
    user_question = sys.argv[1] if len(sys.argv) > 1 else "Krishna"
    client = chromadb.PersistentClient(path="chroma_store")
    collection = client.get_or_create_collection("my_collection")

    # 🔁 Load new chunks
    with open("extractedChunks.json", "r", encoding="utf-8") as f:
        chunks = json.load(f)

    if not chunks:
        print(json.dumps({ "answer": "❌ No chunks found in the file." }))
        sys.exit()

    # 🔥 Delete previous documents
    collection.delete(where={"source": {"$eq": "upload"}})

    # 🖕 Add only current document chunks
    documents = chunks
    metadatas = [{"source": "upload"} for _ in chunks]
    ids = [str(i) for i in range(len(chunks))]
    collection.add(documents=documents, metadatas=metadatas, ids=ids)

    # 🔍 Query
    results = collection.query(query_texts=[user_question], n_results=3)
    docs = results["documents"][0]
    dists = results["distances"][0]

    # ✅ Apply threshold
    filtered = [(doc, dist) for doc, dist in zip(docs, dists) if dist < 0.90]

    if not filtered:
        print(json.dumps({ "answer": "❌ No relevant answer found in our database" }))
    else:
        best_doc = filtered[0][0]
        print(json.dumps({ "answer": best_doc }))

    # ✅ Document count for debug
    total_docs = len(collection.get()["documents"])
    print(f"📄 Current total documents in collection: {total_docs}")

except Exception as e:
    print(json.dumps({ "error": str(e) }))
