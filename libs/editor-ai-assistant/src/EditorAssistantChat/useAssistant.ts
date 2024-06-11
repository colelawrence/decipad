import type { UserMessage } from '@decipad/react-contexts';
import { ControllerProvider, useAIChatHistory } from '@decipad/react-contexts';
import { useCallback, useContext, useMemo, useRef } from 'react';
import type { Action } from 'libs/notebook-open-api/src/actions';
import { actions } from 'libs/notebook-open-api/src/actions';
import { callAction } from 'libs/notebook-open-api/src/callAction';
import type { EditorController } from '@decipad/notebook-tabs';
import type {
  RequiredActionFunctionToolCall,
  RunSubmitToolOutputsParams,
} from 'openai/resources/beta/threads/runs/runs';
import type { MessageCreateParams } from 'openai/resources/beta/threads/messages/messages';
import { useComputer } from '@decipad/editor-hooks';

type ModelAgentOptions = {
  notebookId: string;
};

// ! This is a hook for moving to new assistants API, we won't use it as of now
export const useAssistant = ({ notebookId }: ModelAgentOptions) => {
  const [threads, mapThreadToChat] = useAIChatHistory((state) => [
    state.threads,
    state.mapThreadToChat,
  ]);

  const handleMapThreadToChat = mapThreadToChat(notebookId);

  const threadId = useMemo(() => threads[notebookId], [threads, notebookId]);

  const computer = useComputer();
  const controller = useContext(ControllerProvider);

  const abortController = useRef(new AbortController());

  const { signal } = abortController.current;

  const stopGenerating = useCallback(() => {
    abortController.current.abort();
    abortController.current = new AbortController();
  }, [abortController]);

  const createNewThread = useCallback(async () => {
    const response = await fetch(`/api/ai/assistant/${notebookId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (response.status !== 200) {
      const err = await response.json();

      throw new Error(err.message);
    }

    const result = await response.json();

    return result.threadId as string;
  }, [notebookId, signal]);

  const addMessageToThread = useCallback(
    async (userMessage: UserMessage, chatId: string) => {
      const message: MessageCreateParams = {
        role: 'user',
        content: userMessage.content,
      };

      const response = await fetch(
        `/api/ai/assistant/${notebookId}/${chatId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
          signal,
        }
      );

      if (response.status !== 200) {
        const err = await response.json();

        throw new Error(err.message);
      }
    },
    [notebookId, signal]
  );

  const createNewRun = useCallback(
    async (chatId: string) => {
      const response = await fetch(
        `/api/ai/assistant/run/${notebookId}/${chatId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          signal,
        }
      );

      if (response.status !== 200) {
        const err = await response.json();

        throw new Error(err.message);
      }

      const result = await response.json();

      return result.runId as string;
    },
    [notebookId, signal]
  );

  const callNotebookActions = useCallback(
    async (actionFromRun: RequiredActionFunctionToolCall) => {
      const { function: func } = actionFromRun;
      let params: unknown = {};

      try {
        params = JSON.parse(func.arguments);
      } catch (err) {
        throw new Error('Could not parse arguments');
      }

      const actionName = func.name as keyof typeof actions;

      const action = actions[actionName] as Action<typeof actionName>;

      if (!action) {
        console.error(`Unknown function ${action}`);
        throw new Error(`Unknown function ${action}`);
      }

      let output: RunSubmitToolOutputsParams.ToolOutput = {
        tool_call_id: actionFromRun.id,
        output: '',
      };

      if (controller) {
        const subEditor = controller.getTabEditorAt(0);

        if (!subEditor) {
          throw new Error('Could not get sub editor');
        }

        let result: any;

        try {
          result = await callAction({
            editor: controller as EditorController,
            subEditor,
            computer,
            action,
            params,
          });
        } catch (err) {
          console.error(err);
          result = {
            error: (err as Error).message,
          };
        } finally {
          output = {
            tool_call_id: actionFromRun.id,
            output: JSON.stringify(result),
          };
        }
      }
      return output;
    },
    [computer, controller]
  );

  const getRunResult = useCallback(
    async (chatId: string, runId: string) => {
      // First, we get the result of the run
      const response = await fetch(
        `/api/ai/assistant/run/${notebookId}/${chatId}/${runId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal,
        }
      );

      if (response.status !== 200) {
        const err = await response.json();

        throw new Error(err.message);
      }

      const result = await response.json();

      if (!result) {
        throw new Error(
          'Response is empty. Likely a timeout error, try again later.'
        );
      }

      if (result.status === 'failed' || result.status === 'expired') {
        throw new Error('Run failed');
      }

      if (result.status === 'cancelled') {
        throw new Error('Run cancelled');
      }

      if (result.status === 'completed') {
        return;
      }

      if (result.actions) {
        const outputs = result.actions.map(
          async (actionFromRun: RequiredActionFunctionToolCall) => {
            const output = await callNotebookActions(actionFromRun);

            return output;
          }
        );

        const out = await Promise.all(outputs);

        const res = await fetch(
          `/api/ai/assistant/run/${notebookId}/${chatId}/${runId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ result: out }),
            signal,
          }
        );

        if (res.status !== 200) {
          const err = await response.json();

          throw new Error(err.message);
        }

        await getRunResult(chatId, runId);
      }

      throw new Error('Unknown run status');
    },
    [callNotebookActions, notebookId, signal]
  );

  const getMessageHistory = useCallback(
    async (chatId: string) => {
      const response = await fetch(
        `/api/ai/assistant/${notebookId}/${chatId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },

          signal,
        }
      );

      if (response.status !== 200) {
        const err = await response.json();

        throw new Error(err.message);
      }

      const result = await response.json();

      if (!result) {
        throw new Error(
          'Response is empty. Likely a timeout error, try again later.'
        );
      }

      return result;
    },
    [notebookId, signal]
  );

  const callAssistant = useCallback(
    (chatId?: string) =>
      async (userMessage: UserMessage): Promise<void> => {
        // ? This code probably belongs to its own lambda or mutation, but let's keep it here for now

        // TODO: Append user message to chat

        let thread = chatId;

        // If there is no thread, we need to create a new thread
        if (!thread) {
          // TODO: Add catch for error
          const newThreadId = await createNewThread();
          handleMapThreadToChat(newThreadId);
          thread = newThreadId;

          if (!thread) {
            throw new Error('Thread ID is empty');
          }
        }

        // Now we attach new message to the thread
        // TODO: Add catch for error
        await addMessageToThread(userMessage, thread);

        // Now we create a run for the thread
        // TODO: Add catch for error
        const run = await createNewRun(thread);

        if (!run) {
          throw new Error('Run ID is empty');
        }

        await getRunResult(thread, run);

        const messages = await getMessageHistory(thread);

        if (!messages) {
          throw new Error('Messages are empty');
        }
      },
    [
      addMessageToThread,
      createNewRun,
      createNewThread,
      getRunResult,
      handleMapThreadToChat,
      getMessageHistory,
    ]
  );

  const generateResponse = useMemo(
    () => callAssistant(threadId),
    [callAssistant, threadId]
  );

  return {
    generateResponse,
    stopGenerating,
  };
};
