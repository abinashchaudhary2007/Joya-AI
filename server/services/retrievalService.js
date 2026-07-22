import supabase from "../config/supabase.js";

const cosineSimilarity = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return 0;
  }
  const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  return dot / (magnitudeA * magnitudeB);
};

const rankDocuments = (documents, queryEmbedding) =>
  documents
    .map((document) => ({
      ...document,
      score: cosineSimilarity(queryEmbedding, document.embedding || []),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

const fetchAllDocuments = async () => {
  const { data, error } = await supabase.from("documents").select("id,title,content,embedding");
  if (error) {
    console.error("Supabase document fetch error:", error);
    throw new Error("Failed to fetch documents from Supabase.");
  }
  return data || [];
};

export const getRelevantDocuments = async (queryEmbedding, limit = 5) => {
  if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
    throw new Error("Query embedding is required for retrieval.");
  }

  const vectorFunction = process.env.SUPABASE_VECTOR_SEARCH_FUNCTION || "match_documents";

  try {
    const { data, error } = await supabase.rpc(vectorFunction, {
      query_embedding: queryEmbedding,
      match_count: limit,
    });

    if (error) {
      throw error;
    }

    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (error) {
    console.warn(
      "Supabase vector search RPC failed, falling back to local ranking:",
      error.message || error
    );
  }

  const documents = await fetchAllDocuments();
  return rankDocuments(documents, queryEmbedding).slice(0, limit);
};
