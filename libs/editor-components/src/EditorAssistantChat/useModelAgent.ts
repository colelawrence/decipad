import {
  EventMessage,
  Message,
  UserMessage,
  useAIChatHistory,
  useAISettings,
  useComputer,
} from '@decipad/react-contexts';
import { useCallback } from 'react';
import { AgentAPIPayload } from './types';
import { ChatCompletionMessage } from 'openai/resources';
import { nanoid } from 'nanoid';
import { humanizeFunctionName, mapChatHistoryToGPTChat } from './helpers';
import {
  addCalculation,
  addParagraph,
  addTable,
  addVariable,
  turnVarToInputWidget,
  turnVarToSlider,
  uploadFileByUrl,
} from './notebook-mutations';
import { MyEditor } from '@decipad/editor-types';

type ModelAgentOptions = {
  editor: MyEditor;
  notebookId: string;
};

export const useModelAgent = ({ notebookId, editor }: ModelAgentOptions) => {
  const aiConfig = useAISettings((state) => state.aiConfig);

  const [addMessage, updateEventMessage, updateMessageStatus] =
    useAIChatHistory((state) => [
      state.addMessage,
      state.updateEventMessage,
      state.updateMessageStatus,
    ]);

  const handleAddMessage = addMessage(notebookId);
  const handleUpdateMessageStatus = updateMessageStatus(notebookId);
  const handleUpdateEventMessage = updateEventMessage(notebookId);

  const computer = useComputer();

  const agentConfig = aiConfig.createMode;

  const initCreateAgent = useCallback(
    async (
      messages: Message[],
      userMessage: UserMessage,
      eventMessage: EventMessage
    ): Promise<void> => {
      try {
        const body: AgentAPIPayload = {
          messages: mapChatHistoryToGPTChat(messages),
          agent: 'create',
          config: agentConfig,
        };

        const response = await fetch(`/api/ai/chat/${notebookId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (response.status !== 200) {
          const err = await response.json();

          throw new Error(err.message);
        }

        const message: ChatCompletionMessage = await response.json();

        if (message.function_call) {
          const { function_call: functionCall } = message;

          let args: any = {};

          try {
            args = JSON.parse(functionCall.arguments);
          } catch (err) {
            throw new Error('Could not parse arguments');
          }

          const newEvent = {
            id: nanoid(),
            content: humanizeFunctionName(functionCall.name),
            function_call: functionCall,
          };

          handleUpdateEventMessage(eventMessage.id, newEvent);

          const updatedMessages = messages.map((msg) => {
            if (msg.id === eventMessage.id && msg.type === 'event') {
              return {
                ...msg,
                events: [...(msg.events || []), newEvent],
              };
            }
            return msg;
          });

          switch (functionCall.name) {
            case 'add_variable':
              addVariable(args, editor);
              break;
            case 'add_calculation':
              addCalculation(args, editor);
              break;
            case 'add_paragraph':
              addParagraph(args, editor);
              break;
            case 'variable_to_input_widget':
              turnVarToInputWidget(args, editor);
              break;
            case 'add_table':
              addTable(args, editor);
              break;
            case 'input_widget_to_slider':
              turnVarToSlider(args, editor);
              break;
            case 'upload_file_by_url':
              if (computer) {
                uploadFileByUrl(args, editor, computer);
              }
              break;
          }

          // Recursively call the agent again until we get a response without a function call
          return initCreateAgent(updatedMessages, userMessage, eventMessage);
        }

        if (!('function_call' in message)) {
          handleUpdateMessageStatus(eventMessage.id, 'success');
          handleAddMessage({
            type: 'assistant',
            id: nanoid(),
            content: message.content || 'All done! What else can I help with?',
            timestamp: Date.now(),
            replyTo: userMessage.id,
            status: 'success',
          });
        }
      } catch (err) {
        console.error(err);
        handleAddMessage({
          type: 'event',
          id: nanoid(),
          content: `Error: ${(err as Error).message}`,
          timestamp: Date.now(),
          replyTo: userMessage.id,
          status: 'error',
        });
        handleUpdateMessageStatus(eventMessage.id, 'error');
      }
    },
    [
      agentConfig,
      computer,
      editor,
      handleAddMessage,
      handleUpdateEventMessage,
      handleUpdateMessageStatus,
      notebookId,
    ]
  );

  return {
    initCreateAgent,
  };
};
