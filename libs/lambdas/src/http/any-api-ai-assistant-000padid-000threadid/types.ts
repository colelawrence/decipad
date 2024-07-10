import { MessageCreateParams } from 'openai/resources/beta/threads/messages';

export type RequestPayload = {
  message: MessageCreateParams;
};
