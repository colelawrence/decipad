import {
  GetSuggestedNotebookChangesDocument,
  GetSuggestedNotebookChangesQuery,
} from '@decipad/graphql-client';
import { EditorController } from '@decipad/notebook-tabs';
import {
  Message,
  UserMessage,
  useAIChatHistory,
} from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { TOperation } from '@udecode/plate';

import { nanoid } from 'nanoid';
import { useCallback, useMemo, useState } from 'react';
import { useClient } from 'urql';

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

  const client = useClient();

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

  const getAssistantChanges = useCallback(
    async (prompt: string) => {
      const res = await client.executeQuery<GetSuggestedNotebookChangesQuery>(
        {
          query: GetSuggestedNotebookChangesDocument,
          key: Math.random(),
          variables: {
            notebookId,
            prompt,
          },
        },
        { requestPolicy: 'network-only' }
      );

      // eslint-disable-next-line no-console
      console.debug('response from assistant changes', res);

      if (res.error) {
        throw res.error;
      }

      const operations = res.data?.suggestNotebookChanges?.operations;
      const summary = res.data?.suggestNotebookChanges?.summary;

      return { operations, summary };
    },
    [client, notebookId]
  );

  const applyChanges = useCallback(
    (operations: TOperation[]) => {
      const toastId = toast.info('Applying changes...', { autoDismiss: false });

      // Disable normalizer
      if (operations.length > 0) {
        controller.WithoutNormalizing(() => {
          for (const op of operations) {
            try {
              // We apply the changes as if they are "remote".
              // So we need this to avoid a cycle.
              (op as any).IS_LOCAL_SYNTHETIC = true;
              controller.apply(op as TOperation);
            } catch (err) {
              toast.error('Error applying changes');
              console.error('error applying: ', op, err);
              throw err;
            }
          }
        });
      }
      toast.delete(toastId);
    },
    [controller, toast]
  );

  // TODO: Refactor refactor refactor
  const getAssistantResponse = async (
    chatId: string,
    updatedMessages: Message[],
    userMessage: Message
  ) => {
    const newResponse: Message = {
      content: 'Generating response...',
      role: 'assistant',
      type: 'pending',
      id: nanoid(),
      replyTo: userMessage.id,
    };
    handleAddMessage(newResponse);
    try {
      const response = await fetch(`/api/ai/chat/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          updatedMessages.map((message) => {
            const {
              id: _id,
              replyTo: _replyTo,
              type: _type,
              ...rest
            } = message;
            return rest;
          })
        ),
      });

      if (response.status !== 200) {
        const err = await response.json();

        // TODO: remove this when we have a proper error handling
        if (err.name === 'Error') {
          throw new Error(err.message);
        }
      }

      const result: Message = await response.json();

      // TODO: make this check more explicit
      if (!('function_call' in result)) {
        handleUpdateMessage({
          ...newResponse,
          content: result.content,
          type: 'success',
        });
        return;
      }

      handleUpdateMessage({
        ...newResponse,
        content: 'Got it. Let me update the document for you...',
        type: 'pending',
      });

      const toastId = toast.info('Getting changes...', { autoDismiss: false });
      try {
        const changes = await getAssistantChanges(
          (userMessage as UserMessage).content
        );

        if (changes?.operations) {
          applyChanges(changes.operations as TOperation[]);
        }
        if (changes?.summary) {
          handleUpdateMessage({
            ...newResponse,
            content: changes.summary,
            type: 'success',
          });
        }
      } finally {
        toast.delete(toastId);
      }
    } catch (error) {
      console.error(error);
      handleUpdateMessage({
        ...newResponse,
        content: 'Error generating response',
        type: 'error',
      });
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
    setIsGeneratingResponse(true);

    await getAssistantResponse(notebookId, updatedMessages, newMessage);

    setIsGeneratingResponse(false);
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

    setIsGeneratingResponse(true);

    await getAssistantResponse(notebookId, updatedMessages, userMessage);

    setIsGeneratingResponse(false);
  };

  return {
    messages,
    sendUserMessage,
    regenerateResponse,
    isGeneratingResponse,
  };
};
