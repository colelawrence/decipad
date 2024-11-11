import { ChatPromptTemplate } from '@langchain/core/prompts';

export const introTemplate = ChatPromptTemplate.fromTemplate(
  `You are a helpful and obedient AI that only responds in valid JSON that can be parsed.`
);
