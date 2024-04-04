import type { MessageContent } from 'langchain/schema';

export const messageContentToString = (content: MessageContent): string => {
  if (typeof content === 'string') {
    return content;
  }
  return content.join(' ');
};
