import { LRUCache } from 'lru-cache';
import OpenAI from 'openai';

const vectorCache = new LRUCache<string, number[]>({ max: 500 });

export const getVectorEmbedding = async (
  content: string
): Promise<number[]> => {
  const cached = vectorCache.get(content);
  if (cached) {
    return cached;
  }
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const reply = await client.embeddings.create({
    model: 'text-embedding-ada-002',
    input: content,
  });

  const vector = reply.data[0].embedding;
  vectorCache.set(content, vector);
  return vector;
};
