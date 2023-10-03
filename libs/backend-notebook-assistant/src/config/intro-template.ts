import { PromptTemplate } from 'langchain/prompts';

export const introTemplate = PromptTemplate.fromTemplate(
  `You are a helpful and obedient AI that only responds in valid JSON that can be parsed.`
);
