import {
  AIMode,
  EventMessage,
  Message,
  UserMessage,
  useAIChatHistory,
} from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { useCallback } from 'react';

import { useModelAgent } from './useModelAgent';
import { useConversationAgent } from './useConversationAgent';

import { nanoid } from 'nanoid';
import { useAgentMode } from './useAgentMode';
import { MyEditor } from '@decipad/editor-types';

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

  const { initCreateAgent } = useModelAgent({
    notebookId,
    editor,
  });

  const { initConversationAgent } = useConversationAgent({
    notebookId,
  });

  const { selectAgentMode } = useAgentMode({
    notebookId,
  });

  const getChatAgentResponse = useCallback(
    async (
      messages: Message[],
      userMessage: UserMessage,
      command: AIMode = 'auto'
    ) => {
      try {
        if (command === 'auto') {
          const newMode = await selectAgentMode(messages);
          await getChatAgentResponse(messages, userMessage, newMode);
        }
        if (command === 'create') {
          const eventMessage: EventMessage = {
            timestamp: Date.now(),
            status: 'pending',
            type: 'event',
            id: nanoid(),
            events: [],
            replyTo: userMessage.id,
          };

          handleAddMessage(eventMessage);
          await initCreateAgent(
            [...messages, eventMessage],
            userMessage,
            eventMessage
          );
        }
        if (command === 'ask') {
          const eventMessage: EventMessage = {
            timestamp: Date.now(),
            content: 'Generating response...',
            status: 'pending',
            type: 'event',
            id: nanoid(),
            replyTo: userMessage.id,
          };

          handleAddMessage(eventMessage);
          await initConversationAgent(
            [...messages, eventMessage],
            userMessage,
            eventMessage
          );
        }
      } catch (err) {
        console.error(err);
        toast.error(
          "Couldn't get response from AI assistant. Please try again later."
        );
      }
    },
    [
      initConversationAgent,
      initCreateAgent,
      selectAgentMode,
      toast,
      handleAddMessage,
    ]
  );

  return {
    getChatAgentResponse,
  };
};
