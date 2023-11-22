import {
  EventMessage,
  Message,
  UserMessage,
  useAIChatHistory,
} from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { MyEditor } from '@decipad/editor-types';
import { useAgent } from './useAgent';

export interface ChatAssistantHelperOptions {
  notebookId: string;
  editor: MyEditor;
}

export const useChatAssistantHelper = ({
  notebookId,
  editor,
}: ChatAssistantHelperOptions) => {
  const toast = useToast();

  const addMessage = useAIChatHistory((state) => state.addMessage);

  const handleAddMessage = addMessage(notebookId);

  const { initAgent } = useAgent({
    notebookId,
    editor,
  });

  const getChatAgentResponse = useCallback(
    async (messages: Message[], userMessage: UserMessage) => {
      try {
        const eventMessage: EventMessage = {
          timestamp: Date.now(),
          status: 'pending',
          type: 'event',
          id: nanoid(),
          events: [],
          replyTo: userMessage.id,
        };

        handleAddMessage(eventMessage);
        await initAgent([...messages, eventMessage], userMessage, eventMessage);
      } catch (err) {
        console.error(err);
        toast.error(
          "Couldn't get response from AI assistant. Please try again later."
        );
      }
    },
    [initAgent, toast, handleAddMessage]
  );

  return {
    getChatAgentResponse,
  };
};
