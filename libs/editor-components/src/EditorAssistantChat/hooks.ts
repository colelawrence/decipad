import {
  GetSuggestedNotebookChangesDocument,
  GetSuggestedNotebookChangesQuery,
} from '@decipad/graphql-client';
import { EditorController } from '@decipad/notebook-tabs';
import { Message, useAIChatHistory } from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { getDefined } from '@decipad/utils';
import { TOperation } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { useCallback, useMemo, useState } from 'react';
import { useClient } from 'urql';

export const useAssistantChat = (
  notebookId: string,
  controller: EditorController
) => {
  const [chats, addMessage, deleteMessage] = useAIChatHistory((state) => [
    state.chats,
    state.addMessage,
    state.deleteMessage,
  ]);

  const messages = useMemo(() => chats[notebookId] || [], [chats, notebookId]);

  const handleAddMessage = addMessage(notebookId);
  const handleDeleteMessage = deleteMessage(notebookId);

  const client = useClient();

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

  const getAssistantChanges = useCallback(
    async (
      prompt: string
    ): Promise<GetSuggestedNotebookChangesQuery['suggestNotebookChanges']> => {
      const res = await client.executeQuery<GetSuggestedNotebookChangesQuery>({
        query: GetSuggestedNotebookChangesDocument,
        key: Math.random(),
        variables: {
          notebookId,
          prompt,
        },
      });

      return res.data?.suggestNotebookChanges;
    },
    [client, notebookId]
  );

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

  const makeChanges = useCallback(
    async (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      if (msg == null) {
        throw new Error('Should always be able to find the message');
      }

      if (msg.replyTo == null) {
        throw new Error('Message is not replying to anything');
      }
      const userMessage = getUserMessageFromReplyTo(msg.replyTo)!;
      if (userMessage.content == null || userMessage.content?.length === 0) {
        throw new Error('The content is empty');
      }

      const assistantReply = await getAssistantChanges(userMessage.content);
      if (assistantReply?.operations && assistantReply.operations.length > 0) {
        // Disable normalizer
        controller.WithoutNormalizing(() => {
          for (const op of getDefined(assistantReply.operations)) {
            try {
              // We apply the changes as if they are "remote".
              // So we need this to avoid a cycle.
              (op as any).IS_LOCAL_SYNTHETIC = true;
              controller.apply(op as TOperation);
            } catch (err) {
              console.error('error applying: ', op, err);
              throw err;
            }
          }
        });
      }
    },
    [controller, getAssistantChanges, getUserMessageFromReplyTo, messages]
  );

  return {
    messages,
    sendUserMessage,
    regenerateResponse,
    loading,
    makeChanges,
  };
};
