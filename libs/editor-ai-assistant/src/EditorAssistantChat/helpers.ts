import type { Message } from '@decipad/react-contexts';
import type { ChatCompletionMessageParam } from 'openai/resources';

export const mapChatHistoryToGPTChat = (
  data: Message[]
): ChatCompletionMessageParam[] => {
  const newHistory = data
    .map((message) => {
      const { type, content } = message;

      if (type === 'user') {
        return {
          role: 'user',
          content,
        } as ChatCompletionMessageParam;
      }
      if (type === 'assistant') {
        return {
          role: 'assistant',
          content,
        } as ChatCompletionMessageParam;
      }
      if (type === 'event') {
        const { events } = message;
        if (!events) {
          return {
            role: 'assistant',
            content,
          } as ChatCompletionMessageParam;
        }
        return events
          .map((event) => {
            const {
              content: eventContent,
              function_call: functionCall,
              result,
            } = event;
            return [
              {
                role: 'assistant',
                content: !functionCall ? eventContent : null,
                function_call: functionCall,
              },
              {
                role: 'assistant',
                content: JSON.stringify(result),
              },
            ] as ChatCompletionMessageParam[];
          })
          .flat();
      }
      throw new Error('Invalid message type');
    })
    .flat();

  return newHistory;
};

export const objectToHumanReadableString = (obj: {
  [key: string]: any;
}): string => {
  return Object.entries(obj)
    .map(([key, value]) =>
      !(!value || value.length <= 0)
        ? `${key} is ${JSON.stringify(value)}`
        : `no ${key}`
    )
    .join(', ');
};
