import chromadb

client = chromadb.PersistentClient(path="chroma_store")
collection = client.get_or_create_collection("my_collection")

data = collection.get()
for i, doc in enumerate(data["documents"]):
    print(f"Chunk {i}:\n{doc}\n")
