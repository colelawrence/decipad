import { AIMode, AIModeConfig } from '@decipad/react-contexts';
import { ChatCompletionMessageParam } from 'openai/resources';

export interface AgentAPIPayload {
  messages: ChatCompletionMessageParam[];
  agent: AIMode;
  config: AIModeConfig;
}

export interface AgentResponse {
  content: string;
}

export interface ModePossibility {
  conversation: number;
  modelling: number;
}
