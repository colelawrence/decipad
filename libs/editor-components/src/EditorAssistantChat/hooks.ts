import type { EditorController } from '@decipad/notebook-tabs';
import {
  type Message,
  useAIChatHistory,
  AssistantMessage,
} from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';

import { nanoid } from 'nanoid';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNotebookAssistantHelper } from './useNotebookAssistantHelper';
import { useChatAssistantHelper } from './useChatAssistantHelper';

export const useAssistantChat = (
  notebookId: string,
  controller: EditorController
) => {
  const [chats, addMessage, deleteMessage, updateMessage] = useAIChatHistory(
    (state) => [
      state.chats,
      state.addMessage,
      state.deleteMessage,
      state.updateMessage,
    ]
  );

  const messages = useMemo(() => chats[notebookId] || [], [chats, notebookId]);

  const handleAddMessage = addMessage(notebookId);
  const handleUpdateMessage = updateMessage(notebookId);
  const handleDeleteMessage = deleteMessage(notebookId);

  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const toast = useToast();

  const getAssistantMessageReplyToFromId = useCallback(
    (id: string) => {
      const assistantMessage = messages.find((message) => message.id === id);
      if (!assistantMessage) {
        return null;
      }
      return assistantMessage.replyTo;
    },
    [messages]
  );

  const getUserMessageFromReplyTo = useCallback(
    (replyTo: string) => {
      const userMessage = messages.find((message) => message.id === replyTo);
      if (!userMessage) {
        return null;
      }
      return userMessage;
    },
    [messages]
  );

  const latestAssistantMessage = useRef<AssistantMessage | undefined>();

  const setLatestAssistantMessage = useCallback((message: AssistantMessage) => {
    latestAssistantMessage.current = message;
  }, []);

  const updateLatestAssistantMessage = useCallback(
    (message: Partial<AssistantMessage>) => {
      if (latestAssistantMessage.current) {
        const newLatestResponse = {
          ...latestAssistantMessage.current,
          ...message,
        };
        handleUpdateMessage(newLatestResponse);
        latestAssistantMessage.current = newLatestResponse;
      } else {
        // eslint-disable-next-line no-console
        console.debug('no latest response');
      }
    },
    [handleUpdateMessage, latestAssistantMessage]
  );

  const [gettingChangesToastId, setGettingChangesToastId] = useState<
    string | undefined
  >();

  const { sendPrompt } = useNotebookAssistantHelper({
    notebookId,
    controller,
    updateMessage: updateLatestAssistantMessage,
    onceDone: useCallback(() => {
      if (gettingChangesToastId) {
        toast.delete(gettingChangesToastId);
      }
    }, [gettingChangesToastId, toast]),
  });

  const { newUserMessage } = useChatAssistantHelper({
    addMessage: handleAddMessage,
    chatId: notebookId,
    sendPrompt,
    setGettingChangesToastId,
    setLatestAssistantMessage,
    updateLatestAssistantMessage,
  });

  const sendUserMessage = useCallback(
    async (content: string) => {
      const newMessage: Message = {
        role: 'user',
        content,
        id: nanoid(),
      };

      const updatedMessages = [...messages, newMessage];

      handleAddMessage(newMessage);
      setIsGeneratingResponse(true);

      await newUserMessage(updatedMessages, newMessage);

      setIsGeneratingResponse(false);
    },
    [handleAddMessage, messages, newUserMessage]
  );

  const regenerateResponse = useCallback(
    async (id: string) => {
      const replyTo = getAssistantMessageReplyToFromId(id);

      if (!replyTo) {
        return;
      }
      const userMessage = getUserMessageFromReplyTo(replyTo);

      if (!userMessage) {
        return;
      }

      handleDeleteMessage(id);

      const updatedMessages = [...messages, userMessage];

      setIsGeneratingResponse(true);

      await newUserMessage(updatedMessages, userMessage);

      setIsGeneratingResponse(false);
    },
    [
      getAssistantMessageReplyToFromId,
      getUserMessageFromReplyTo,
      handleDeleteMessage,
      messages,
      newUserMessage,
    ]
  );

  return {
    messages,
    sendUserMessage,
    regenerateResponse,
    isGeneratingResponse,
  };
};
