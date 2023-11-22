import {
  useAIChatHistory,
  UserMessage,
  useAISettings,
} from '@decipad/react-contexts';

import { nanoid } from 'nanoid';
import { useCallback, useMemo } from 'react';

import { useChatAssistantHelper } from './useChatAssistantHelper';
import { MyEditor } from '@decipad/editor-types';

export const useAssistantChat = (notebookId: string, editor: MyEditor) => {
  const [chats, addMessage, clearMessages] = useAIChatHistory((state) => [
    state.chats,
    state.addMessage,
    state.clearMessages,
  ]);

  const [setGeneratingChatResponse] = useAISettings((state) => [
    state.setGeneratingChatResponse,
  ]);

  const messages = useMemo(() => chats[notebookId] || [], [chats, notebookId]);

  const clearChat = clearMessages(notebookId);
  const handleAddMessage = addMessage(notebookId);

  const { getChatAgentResponse } = useChatAssistantHelper({
    notebookId,
    editor,
  });

  const sendUserMessage = useCallback(
    async (message: string) => {
      const newMessage: UserMessage = {
        type: 'user',
        content: message,
        status: 'success',
        id: nanoid(),
        timestamp: Date.now(),
      };

      const updatedMessages = [...messages, newMessage];

      handleAddMessage(newMessage);

      setGeneratingChatResponse(true);

      await getChatAgentResponse(updatedMessages, newMessage);

      setGeneratingChatResponse(false);
    },
    [
      handleAddMessage,
      messages,
      getChatAgentResponse,
      setGeneratingChatResponse,
    ]
  );

  return {
    messages,
    clearChat,
    sendUserMessage,
  };
};
