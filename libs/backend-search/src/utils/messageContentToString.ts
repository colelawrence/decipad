import type { MessageContent } from '@langchain/core/messages';

export const messageContentToString = (content: MessageContent): string => {
  if (typeof content === 'string') {
    return content;
  }
  return content.join(' ');
};
