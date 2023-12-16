import {
  EventMessage,
  Message,
  UserMessage,
  useAIChatHistory,
} from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { useCallback } from 'react';
import { useAgent } from './useAgent';
import { nanoid } from 'nanoid';

export interface ChatAssistantHelperOptions {
  notebookId: string;
}

export const useChatAssistantHelper = ({
  notebookId,
}: ChatAssistantHelperOptions) => {
  const toast = useToast();

  const addMessage = useAIChatHistory((state) => state.addMessage);

  const handleAddMessage = addMessage(notebookId);

  const { submitChat, stopGenerating } = useAgent({
    notebookId,
  });

  const getChatResponse = useCallback(
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

        const newMessages = [...messages, eventMessage];

        await submitChat(newMessages, userMessage, eventMessage);
      } catch (err) {
        console.error(err);
        toast.error(
          "Couldn't get response from AI assistant. Please try again later."
        );
      }
    },
    [submitChat, toast, handleAddMessage]
  );

  return {
    getChatResponse,
    stopGenerating,
  };
};
