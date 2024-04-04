import type { UserMessage } from '@decipad/react-contexts';
import { useAIChatHistory } from '@decipad/react-contexts';

import { nanoid } from 'nanoid';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useChatAssistantHelper } from './useChatAssistantHelper';

export const useAssistantChat = (notebookId: string) => {
  const [
    chats,
    addMessage,
    deleteMessage,
    clearMessages,
    isFirstInteraction,
    startInteraction,
  ] = useAIChatHistory((state) => [
    state.chats,
    state.addMessage,
    state.deleteMessage,
    state.clearMessages,
    state.isFirstInteraction,
    state.startInteraction,
  ]);

  const [isGeneratingResponse, setGeneratingResponse] = useState(false);

  const currentUserMessage = useRef<UserMessage>();

  const messages = useMemo(() => chats[notebookId] || [], [chats, notebookId]);

  const clearChat = clearMessages(notebookId);
  const handleAddMessage = addMessage(notebookId);
  const handleDeleteMessage = deleteMessage(notebookId);

  const { getChatResponse, stopGenerating } = useChatAssistantHelper({
    notebookId,
  });

  const regenerateResponse = useCallback(async () => {
    if (!currentUserMessage.current) {
      return;
    }
    const replies = messages.filter(
      (message) => message.replyTo === currentUserMessage.current?.id
    );

    replies.forEach((reply) => {
      handleDeleteMessage(reply.id);
    });

    // A bit wonky
    const newMessages = messages.filter(
      (message) => !replies.find((reply) => reply.id === message.id)
    );

    setGeneratingResponse(true);
    await getChatResponse(newMessages, currentUserMessage.current);
    setGeneratingResponse(false);
  }, [getChatResponse, messages, handleDeleteMessage]);

  const sendUserMessage = useCallback(
    async (message: string) => {
      startInteraction();

      const newMessage: UserMessage = {
        type: 'user',
        content: message,
        status: 'success',
        id: nanoid(),
        timestamp: Date.now(),
      };

      handleAddMessage(newMessage);

      currentUserMessage.current = newMessage;

      const newMessages = [...messages, newMessage];

      setGeneratingResponse(true);

      await getChatResponse(newMessages, newMessage);

      setGeneratingResponse(false);
    },
    [handleAddMessage, messages, getChatResponse, startInteraction]
  );

  return {
    messages,
    clearChat,
    sendUserMessage,
    stopGenerating,
    regenerateResponse,
    isGeneratingResponse,
    isFirstInteraction,
    currentUserMessage: currentUserMessage.current,
  };
};
