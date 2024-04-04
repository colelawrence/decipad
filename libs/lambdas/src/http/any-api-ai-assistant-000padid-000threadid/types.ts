import type { MessageCreateParams } from 'openai/resources/beta/threads/messages/messages';

export type RequestPayload = {
  message: MessageCreateParams;
};
