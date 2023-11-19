const OpenAI = require('openai');

exports.createVectorEmbedding = async (content) => {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const reply = await client.embeddings.create({
    model: 'text-embedding-ada-002',
    input: content,
  });

  return reply.data[0].embedding;
};
