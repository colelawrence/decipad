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

import { nanoid } from 'nanoid';

import {
  Action,
  GenericSummaryResult,
  actions,
  callAction,
} from '@decipad/notebook-open-api';
import { EditorController } from '@decipad/notebook-tabs';
import { parseIntegration } from '@decipad/utils';
import { useRemoteAgent } from './useRemoteAgent';
import { OutOfCreditsError } from './OutOfCreditsError';
import { useActiveEditor } from '@decipad/editor-hooks';
import { objectToHumanReadableString } from './helpers';

type AgentParams = {
  notebookId: string;
};

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

  const subEditor = useActiveEditor(controller);

  const { updateUsage } = useAiUsage();

  const abortController = useRef(new AbortController());

  const { signal } = abortController.current;

  const stopGenerating = useCallback(() => {
    abortController.current.abort();
    abortController.current = new AbortController();
  }, [abortController]);

  const remoteAgent = useRemoteAgent({ notebookId });

  const submitChat = useCallback(
    // eslint-disable-next-line complexity
    async (
      messages: Message[],
      userMessage: UserMessage,
      eventMessage: EventMessage,
      forceMode?: 'creation' | 'conversation'
    ): Promise<void> => {
      try {
        const { mode, usage, message } = await remoteAgent.setMessage(
          {
            forceMode,
            messages,
          },
          signal
        );
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
              if (!subEditor) {
                throw new Error('Could not get sub editor');
              }

              try {
                const result = await callAction({
                  editor: controller as EditorController,
                  subEditor,
                  computer,
                  action,
                  params,
                });

                const newEvent = {
                  id: nanoid(),
                  content:
                    'notebookErrors' in result
                      ? (result.result as GenericSummaryResult).summary ||
                        // Fallback summary for better UX
                        'Updated notebook data'
                      : (result as GenericSummaryResult).summary ||
                        // Fallback summary for better UX
                        'Updated notebook data',
                  function_call: functionCall,
                  result: `Result is: ${objectToHumanReadableString(result)}`,
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
                  result: JSON.stringify(err),
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
            return submitChat(
              newMessages,
              userMessage,
              newEventMessage,
              'creation'
            );
          }
          handleUpdateMessageStatus(eventMessage.id, 'success');
          if (message.content) {
            try {
              const { answer, suggestions } = JSON.parse(message.content);

              handleAddMessage({
                type: 'assistant',
                id: nanoid(),
                content: answer,
                suggestions,
                timestamp: Date.now(),
                replyTo: userMessage.id,
                status: 'success',
              });
            } catch (err) {
              // Try to extract the answer from the message when AI hallucinates
              // and returns invalid JSON
              const findAnswer = message.content.match(/"answer":\s*"(.*)"/);

              if (findAnswer) {
                const answerString = findAnswer[1].replace(/\\n/g, '\n');

                handleAddMessage({
                  type: 'assistant',
                  id: nanoid(),
                  content: answerString,
                  timestamp: Date.now(),
                  replyTo: userMessage.id,
                  status: 'success',
                });
              } else {
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
          }
        }
        if (mode === 'conversation') {
          handleDeleteMessage(eventMessage.id);

          if (message.content) {
            try {
              const { answer, suggestions } = JSON.parse(message.content);

              handleAddMessage({
                type: 'assistant',
                id: nanoid(),
                content: answer,
                suggestions,
                timestamp: Date.now(),
                replyTo: userMessage.id,
                status: 'success',
              });
            } catch (err) {
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
      remoteAgent,
      signal,
      updateUsage,
      controller,
      computer,
      handleAddEventToMessage,
      handleAddMessage,
      handleDeleteMessage,
      handleUpdateMessageStatus,
      subEditor,
    ]
  );

  return {
    submitChat,
    stopGenerating,
  };
};
