/* eslint-disable complexity */
import {
  ControllerProvider,
  EventMessage,
  Message,
  UserMessage,
  useAIChatHistory,
  useAiUsage,
  useComputer,
} from '@decipad/react-contexts';
import { useCallback, useContext, useRef } from 'react';

import { ChatCompletionMessage } from 'openai/resources';
import { nanoid } from 'nanoid';
import { mapChatHistoryToGPTChat } from './helpers';

import { AiUsage } from '@decipad/interfaces';
import {
  Action,
  CallActionResult,
  actions,
  callAction,
} from '@decipad/notebook-open-api';
import { EditorController } from '@decipad/notebook-tabs';
import { parseIntegration } from '@decipad/utils';

type AgentParams = {
  notebookId: string;
};

const TOO_MANY_REQUESTS = 429;

class OutOfCreditsError extends Error {}

export const useAgent = ({ notebookId }: AgentParams) => {
  const [addMessage, deleteMessage, addEventToMessage, updateMessageStatus] =
    useAIChatHistory((state) => [
      state.addMessage,
      state.deleteMessage,
      state.addEventToMessage,
      state.updateMessageStatus,
    ]);

  const handleAddMessage = addMessage(notebookId);
  const handleDeleteMessage = deleteMessage(notebookId);
  const handleUpdateMessageStatus = updateMessageStatus(notebookId);
  const handleAddEventToMessage = addEventToMessage(notebookId);

  const computer = useComputer();
  const controller = useContext(ControllerProvider);

  const { updateUsage } = useAiUsage();

  const abortController = useRef(new AbortController());

  const { signal } = abortController.current;

  const stopGenerating = useCallback(() => {
    abortController.current.abort();
    abortController.current = new AbortController();
  }, [abortController]);

  const submitChat = useCallback(
    // eslint-disable-next-line complexity
    async (
      messages: Message[],
      userMessage: UserMessage,
      eventMessage: EventMessage
    ): Promise<void> => {
      try {
        const body = {
          messages: mapChatHistoryToGPTChat(
            messages.filter(
              (m) => !(m.type === 'event' && m.status === 'ui-only-error')
            )
          ),
        };

        const response = await fetch(`/api/ai/chat/${notebookId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal,
        });

        if (response.status === TOO_MANY_REQUESTS) {
          throw new OutOfCreditsError();
        }

        if (response.status !== 200) {
          const err = await response.json();

          throw new Error(err.message);
        }

        const {
          mode,
          message,
          usage,
        }: {
          mode: 'conversation' | 'creation' | 'fetch_data';
          message: ChatCompletionMessage;
          usage: AiUsage;
        } = await response.json();

        updateUsage(usage);

        if (mode === 'creation') {
          if (message.function_call) {
            const { function_call: functionCall } = message;

            let params: any = {};

            try {
              params = JSON.parse(functionCall.arguments);
            } catch (err) {
              throw new Error('Could not parse arguments');
            }

            const actionName = functionCall.name as keyof typeof actions;

            const action = actions[actionName] as Action<typeof actionName>;

            let newEventMessage = eventMessage;
            let newMessages = messages;

            if (!action) {
              console.error(`Unknown function ${action}`);
              throw new Error(`Unknown function ${action}`);
            }

            if (controller) {
              const subEditor = controller.getTabEditorAt(0);

              if (!subEditor) {
                throw new Error('Could not get sub editor');
              }

              try {
                const results = await callAction({
                  editor: controller as EditorController,
                  subEditor,
                  computer,
                  action,
                  params,
                });

                const newEvent = {
                  id: nanoid(),
                  content:
                    // Sorry, I have no clue how to deal with this type
                    (results as CallActionResult<any>).result?.summary ||
                    'Invoked action',
                  function_call: functionCall,
                };

                handleAddEventToMessage(eventMessage.id, newEvent);

                newEventMessage = {
                  ...eventMessage,
                  events: [...(newEventMessage.events || []), newEvent],
                };

                newMessages = messages.map((m) => {
                  if (m.id === eventMessage.id && m.type === 'event') {
                    return newEventMessage;
                  }
                  return m;
                });
              } catch (err) {
                console.error(err);

                const newEvent = {
                  id: nanoid(),
                  content: `Error: ${(err as Error).message}`,
                  function_call: functionCall,
                };

                handleAddEventToMessage(eventMessage.id, newEvent);

                newEventMessage = {
                  ...eventMessage,
                  events: [...(newEventMessage.events || []), newEvent],
                };

                newMessages = messages.map((m) => {
                  if (m.id === eventMessage.id && m.type === 'event') {
                    return newEventMessage;
                  }
                  return m;
                });
              }
            }
            // Recursively call the agent again until we get a response without a function call
            return submitChat(newMessages, userMessage, newEventMessage);
          }
          handleUpdateMessageStatus(eventMessage.id, 'success');
          if (message.content) {
            handleAddMessage({
              type: 'assistant',
              id: nanoid(),
              content: message.content,
              timestamp: Date.now(),
              replyTo: userMessage.id,
              status: 'success',
            });
          }
        }
        if (mode === 'conversation') {
          handleDeleteMessage(eventMessage.id);

          if (message.content) {
            handleAddMessage({
              type: 'assistant',
              id: nanoid(),
              content: message.content,
              timestamp: Date.now(),
              replyTo: userMessage.id,
              status: 'success',
            });
          }
        }

        if (mode === 'fetch_data') {
          handleDeleteMessage(eventMessage.id);

          if (!message.content) {
            throw new Error('Empty response from AI');
          }

          const parsed = await parseIntegration(message.content);

          if (message.content) {
            handleAddMessage({
              type: 'assistant',
              id: nanoid(),
              content: message.content,
              timestamp: Date.now(),
              replyTo: userMessage.id,
              status: 'success',
              ...(parsed ? { integrationData: parsed } : {}),
            });
          }
        }
      } catch (err) {
        console.error(err);
        handleDeleteMessage(eventMessage.id);

        if (err instanceof OutOfCreditsError) {
          handleAddMessage({
            type: 'event',
            id: nanoid(),
            content: "Sorry, you've ran out of AI credits.",
            timestamp: Date.now(),
            replyTo: userMessage.id,
            status: 'ui-only-error',
          });
          return;
        }

        if (err instanceof DOMException && err.name === 'AbortError') {
          handleAddMessage({
            type: 'event',
            id: nanoid(),
            content: 'Request aborted',
            timestamp: Date.now(),
            replyTo: userMessage.id,
            status: 'ui-only-error',
          });
          return;
        }

        if (eventMessage.events && eventMessage.events.length > 0) {
          handleUpdateMessageStatus(eventMessage.id, 'error');
        } else {
          handleDeleteMessage(eventMessage.id);
        }
        handleAddMessage({
          type: 'event',
          id: nanoid(),
          content: `Error: ${(err as Error).message}`,
          uiContent:
            "Sorry, but there was an error. You can retry, hopefully it won't happen again.",
          timestamp: Date.now(),
          replyTo: userMessage.id,
          status: 'error',
        });
      }
    },
    [
      computer,
      controller,
      handleAddEventToMessage,
      handleAddMessage,
      handleDeleteMessage,
      handleUpdateMessageStatus,
      notebookId,
      updateUsage,
      signal,
    ]
  );

  return {
    submitChat,
    stopGenerating,
  };
};
