import {
  EventMessage,
  Message,
  UserMessage,
  useAIChatHistory,
  useAISettings,
} from '@decipad/react-contexts';
import { useCallback } from 'react';
import { AgentAPIPayload } from './types';
import { ChatCompletionMessage } from 'openai/resources';
import { nanoid } from 'nanoid';
import { mapChatHistoryToGPTChat } from './helpers';

type ConversationAgentOptions = {
  notebookId: string;
};

export const useConversationAgent = ({
  notebookId,
}: ConversationAgentOptions) => {
  const aiConfig = useAISettings((state) => state.aiConfig);

  const [addMessage, deleteMessage, updateMessageStatus, updateMessageContent] =
    useAIChatHistory((state) => [
      state.addMessage,
      state.deleteMessage,
      state.updateMessageStatus,
      state.updateMessageContent,
    ]);

  const handleAddMessage = addMessage(notebookId);
  const handleDeleteMessage = deleteMessage(notebookId);
  const handleUpdateMessageStatus = updateMessageStatus(notebookId);
  const handleUpdateMessageContent = updateMessageContent(notebookId);

  const agentConfig = aiConfig.askMode;

  const initConversationAgent = useCallback(
    async (
      messages: Message[],
      userMessage: UserMessage,
      eventMessage: EventMessage
    ) => {
      try {
        const newResponseId = nanoid();

        const body: AgentAPIPayload = {
          messages: mapChatHistoryToGPTChat(messages),
          agent: 'ask',
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

        handleDeleteMessage(eventMessage.id);

        handleAddMessage({
          type: 'assistant',
          id: newResponseId,
          content: message.content || "Couldn't come up with a response...",
          status: 'success',
          timestamp: Date.now(),
          replyTo: userMessage.id,
        });
      } catch (err) {
        console.error(err);
        handleUpdateMessageStatus(eventMessage.id, 'error');
        handleUpdateMessageContent(
          eventMessage.id,
          `Error: ${(err as Error).message}`
        );
      }
    },
    [
      agentConfig,
      handleAddMessage,
      handleDeleteMessage,
      handleUpdateMessageContent,
      handleUpdateMessageStatus,
      notebookId,
    ]
  );

  return {
    initConversationAgent,
  };
};
