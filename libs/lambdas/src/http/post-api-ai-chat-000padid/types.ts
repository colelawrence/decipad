import { ChatCompletionMessageParam } from 'openai/resources';

export type RequestPayload = {
  messages: ChatCompletionMessageParam[];
};
