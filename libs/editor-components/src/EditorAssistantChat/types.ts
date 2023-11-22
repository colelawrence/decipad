import { ChatCompletionMessageParam } from 'openai/resources';

export interface AgentAPIPayload {
  messages: ChatCompletionMessageParam[];
}

export interface AgentResponse {
  content: string;
}

export type AIMode = 'ask' | 'create';
