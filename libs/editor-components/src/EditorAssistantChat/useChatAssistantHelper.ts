import {
  Message,
  UserMessage,
  AssistantMessage,
  useAIChatHistory,
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
  submitFeedback: (rating: 'like' | 'dislike') => (message: string) => void;
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
  const [feedback, clearFeedback] = useAIChatHistory((state) => [
    state.feedback,
    state.clearFeedback,
  ]);

  const submitFeedback = useCallback(
    (rating: 'like' | 'dislike') => async (message: string) => {
      try {
        const response = await fetch('/api/ai/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating,
            message,
            feedback,
          }),
        });

        if (response.status !== 200) {
          const err = await response.json();
          throw new Error(err.message);
        }

        toast.success('Feedback sent');
      } catch (error) {
        console.error(error);
        toast.error('Failed to send feedback');
      } finally {
        clearFeedback();
      }
    },
    [feedback, clearFeedback, toast]
  );

  const newUserMessage = useCallback(
    async (messages: Message[], m: Message) => {
      const newResponse: AssistantMessage = {
        content: 'Generating response...',
        role: 'assistant',
        status: 'pending',
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
              status: _status,
              ...rest
            } = message;
            return rest;
          })
        ),
      });

      if (response.status !== 200) {
        const err = await response.json();

        if (err.name === 'Error') {
          throw new Error(err.message);
        }
      }

      const chatAssistantResponse: Message = await response.json();
      try {
        if (!('function_call' in chatAssistantResponse)) {
          updateLatestAssistantMessage({
            content: chatAssistantResponse.content,
            status: 'success',
          });
          return;
        }

        updateLatestAssistantMessage({
          content: 'Got it. Let me update the document for you...',
          status: 'pending',
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
          status: 'error',
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
    submitFeedback,
  };
};
