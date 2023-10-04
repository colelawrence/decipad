import { Message, useAIChatHistory } from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { nanoid } from 'nanoid';
import { useCallback, useMemo, useState } from 'react';

export const useAssistantChat = (notebookId: string) => {
  const chats = useAIChatHistory((state) => state.chats);
  const addMessage = useAIChatHistory((state) => state.addMessage);
  const deleteMessage = useAIChatHistory((state) => state.deleteMessage);

  const messages = useMemo(() => chats[notebookId] || [], [chats, notebookId]);

  const handleAddMessage = addMessage(notebookId);
  const handleDeleteMessage = deleteMessage(notebookId);

  const [loading, setLoading] = useState(false);
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

  const getAssistantResponse = async (
    chatId: string,
    updatedMessages: Message[],
    userMessageId: string
  ) => {
    try {
      const response = await fetch(`/api/ai/chat/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          updatedMessages.map((message) => {
            const { id: _id, replyTo: _replyTo, ...rest } = message;
            return rest;
          })
        ),
      });
      const result = await response.json();
      const newMessage: Message = {
        ...result,
        role: 'assistant',
        id: nanoid(),
        replyTo: userMessageId,
      };
      handleAddMessage(newMessage);
    } catch (error) {
      console.error(error);
      toast.error(
        "Couldn't get response from AI assistant. Please try again later."
      );
    }
  };

  const sendUserMessage = async (content: string) => {
    const newMessage: Message = {
      role: 'user',
      content,
      id: nanoid(),
    };

    const updatedMessages = [...messages, newMessage];

    handleAddMessage(newMessage);
    setLoading(true);

    await getAssistantResponse(notebookId, updatedMessages, newMessage.id);

    setLoading(false);
  };

  const regenerateResponse = async (id: string) => {
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
    setLoading(true);
    await getAssistantResponse(notebookId, updatedMessages, userMessage.id);
    setLoading(false);
  };

  return {
    messages,
    sendUserMessage,
    regenerateResponse,
    loading,
  };
};
