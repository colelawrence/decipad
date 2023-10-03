const OpenAI = require('openai');
const { once } = require('ramda');

exports.getOpenAI = once(() => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Need the OPENAI_API_KEY env var');
  }
  return new OpenAI({ apiKey });
});
