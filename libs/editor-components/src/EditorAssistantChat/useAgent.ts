import {
  EventMessage,
  Message,
  UserMessage,
  useAIChatHistory,
  useAiUsage,
  useComputer,
} from '@decipad/react-contexts';
import { useCallback } from 'react';
import { AIMode, AgentAPIPayload } from './types';
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
import { RemoteComputer } from '@decipad/remote-computer';
import { AiUsage } from '@decipad/interfaces';

type ModelAgentOptions = {
  editor: MyEditor;
  notebookId: string;
};
const updateDoc = (
  fnCallName: string,
  args: any,
  editor: MyEditor,
  computer: RemoteComputer
) => {
  switch (fnCallName) {
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
};

export const useAgent = ({ notebookId, editor }: ModelAgentOptions) => {
  const [addMessage, deleteMessage, updateEventMessage, updateMessageStatus] =
    useAIChatHistory((state) => [
      state.addMessage,
      state.deleteMessage,
      state.updateEventMessage,
      state.updateMessageStatus,
    ]);

  const handleAddMessage = addMessage(notebookId);
  const handleDeleteMessage = deleteMessage(notebookId);
  const handleUpdateMessageStatus = updateMessageStatus(notebookId);
  const handleUpdateEventMessage = updateEventMessage(notebookId);

  const computer = useComputer();
  const { updateUsage } = useAiUsage();

  const initAgent = useCallback(
    async (
      messages: Message[],
      userMessage: UserMessage,
      eventMessage: EventMessage
    ): Promise<void> => {
      try {
        const body: AgentAPIPayload = {
          messages: mapChatHistoryToGPTChat(messages),
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

        const {
          mode,
          message,
          usage,
        }: { mode: AIMode; message: ChatCompletionMessage; usage: AiUsage } =
          await response.json();

        updateUsage(usage);

        if (mode === 'create') {
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

            updateDoc(functionCall.name, args, editor, computer);
            // Recursively call the agent again until we get a response without a function call
            return initAgent(updatedMessages, userMessage, eventMessage);
          }
          handleUpdateMessageStatus(eventMessage.id, 'success');
          handleAddMessage({
            type: 'assistant',
            id: nanoid(),
            content: message.content || 'All done! What else can I help with?',
            timestamp: Date.now(),
            replyTo: userMessage.id,
            status: 'success',
          });
        } else {
          handleDeleteMessage(eventMessage.id);

          const newResponseId = nanoid();
          handleAddMessage({
            type: 'assistant',
            id: newResponseId,
            content: message.content || "Couldn't come up with a response...",
            status: 'success',
            timestamp: Date.now(),
            replyTo: userMessage.id,
          });
        }
      } catch (err) {
        console.error(err);
        handleUpdateMessageStatus(eventMessage.id, 'error');
        handleAddMessage({
          type: 'event',
          id: nanoid(),
          content: `Error: ${(err as Error).message}`,
          timestamp: Date.now(),
          replyTo: userMessage.id,
          status: 'error',
        });

        // TODO: add this back in
        // if (mode === 'create') {
        //   handleUpdateMessageStatus(eventMessage.id, 'error');
        // }
      }
    },
    [
      notebookId,
      updateUsage,
      handleUpdateMessageStatus,
      handleAddMessage,
      handleUpdateEventMessage,
      editor,
      computer,
      handleDeleteMessage,
    ]
  );

  return {
    initAgent,
  };
};
