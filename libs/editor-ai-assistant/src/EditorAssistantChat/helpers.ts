import { Message } from '@decipad/react-contexts';

import { ChatCompletionMessageParam } from 'openai/resources';

export const humanizeFunctionName = (name: string) => {
  switch (name) {
    case 'add_variable':
      return 'Created a new variable';
    case 'add_calculation':
      return 'Created a new calculation';
    case 'add_paragraph':
      return 'Written a new paragraph';
    case 'variable_to_input_widget':
      return 'Turned a variable into an input widget';
    case 'add_table':
      return 'Generated a new table';
    case 'input_widget_to_slider':
      return 'Turned an input widget into a slider';
    case 'upload_file_by_url':
      return 'Uploaded a file from URL';
    default:
      return name;
  }
};

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
        return events.map((event) => {
          const { content: eventContent, function_call: functionCall } = event;
          return {
            role: 'assistant',
            content: !functionCall ? eventContent : null,
            function_call: functionCall,
          } as ChatCompletionMessageParam;
        });
      }
      throw new Error('Invalid message type');
    })
    .flat();

  return newHistory;
};
