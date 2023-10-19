import {
  Message,
  UserMessage,
  AssistantMessage,
} from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';

export interface ChatAssistantHelperOptions {
  chatId: string;
  addMessage: (message: Message) => unknown;
  updateLatestAssistantMessage: (message: Partial<AssistantMessage>) => unknown;
  setLatestAssistantMessage: (message: AssistantMessage) => unknown;
  setGettingChangesToastId: (toastId: string) => unknown;
  sendPrompt: (prompt: string) => unknown;
}

export interface ChatAssistantHelperResult {
  newUserMessage: (allMessages: Message[], message: Message) => void;
}

export const useChatAssistantHelper = ({
  chatId,
  addMessage,
  setLatestAssistantMessage,
  updateLatestAssistantMessage,
  setGettingChangesToastId,
  sendPrompt,
}: ChatAssistantHelperOptions): ChatAssistantHelperResult => {
  const toast = useToast();

  const newUserMessage = useCallback(
    async (messages: Message[], m: Message) => {
      const newResponse: AssistantMessage = {
        content: 'Generating response...',
        role: 'assistant',
        type: 'pending',
        id: nanoid(),
        replyTo: m.id,
      };
      addMessage(newResponse);
      setLatestAssistantMessage(newResponse);

      const response = await fetch(`/api/ai/chat/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          messages.map((message) => {
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

      const chatAssistantResponse: Message = await response.json();
      try {
        // TODO: make this check more explicit
        if (!('function_call' in chatAssistantResponse)) {
          updateLatestAssistantMessage({
            content: chatAssistantResponse.content,
            type: 'success',
          });
          return;
        }

        updateLatestAssistantMessage({
          content: 'Got it. Let me update the document for you...',
          type: 'pending',
        });

        setGettingChangesToastId(
          toast.info('Getting changes...', {
            autoDismiss: false,
          })
        );

        sendPrompt((m as UserMessage).content);
      } catch (err) {
        console.error(err);
        updateLatestAssistantMessage({
          content: 'Error generating response',
          type: 'error',
        });
        toast.error(
          "Couldn't get response from AI assistant. Please try again later."
        );
      }
    },
    [
      addMessage,
      chatId,
      sendPrompt,
      setGettingChangesToastId,
      setLatestAssistantMessage,
      toast,
      updateLatestAssistantMessage,
    ]
  );

  return {
    newUserMessage,
  };
};
