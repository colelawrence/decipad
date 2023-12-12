import { ChatCompletionMessageParam } from 'openai/resources';

export type RequestPayload = {
  messages: ChatCompletionMessageParam[];
  forceMode?: 'creation' | 'conversation';
};
