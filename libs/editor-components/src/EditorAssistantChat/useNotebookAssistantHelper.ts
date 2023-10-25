import {
  ElapsedEventTime,
  type Feedback,
  type ReplyAssistantMessage,
} from '@decipad/react-contexts';
import type { TOperation } from '@udecode/plate';
import { useCallback, useEffect, useState } from 'react';
import { useNotebookAssistant } from './useNotebookAssistant';
import { useToast } from '@decipad/toast';
import { EditorController } from '@decipad/notebook-tabs';
import { humanizeMotebookAssistantProgressMessage } from './notebookAssistantProgressMessages';
import { NotebookAssistantEventProgress } from './useNotebookAssistantTypes';

export interface NotebookAssistantHelperOptions {
  notebookId: string;
  updateMessage: (message: Partial<ReplyAssistantMessage>) => unknown;
  updateFeedback: (feedbackData: Partial<Feedback>) => unknown;
  updateFeedbackElaspedTime: (elapsed: ElapsedEventTime) => unknown;
  controller: EditorController;
  onceDone: () => unknown;
}

export const useNotebookAssistantHelper = ({
  notebookId,
  updateMessage,
  updateFeedback,
  updateFeedbackElaspedTime,
  controller,
  onceDone,
}: NotebookAssistantHelperOptions) => {
  const toast = useToast();
  const [haveFatalError, setHaveFatalError] = useState(false);
  const [appliedOperations, setAppliedOperations] = useState(false);
  const [haveSummary, setHaveSummary] = useState(false);

  const onError = useCallback(
    (error: string) => {
      toast(error, 'error');
      updateFeedback({
        error,
      });
      updateMessage({
        content: 'Error generating response',
        status: 'error',
      });
      setHaveFatalError(true);
    },
    [toast, updateMessage, updateFeedback]
  );

  const onPrompt = useCallback(
    (prompt: string) => {
      updateFeedback({
        prompt,
      });
      setAppliedOperations(false);
      setHaveSummary(false);
    },
    [updateFeedback]
  );

  const onOperations = useCallback(
    (ops: TOperation[]) => {
      const toastId = toast.info('Applying changes...', { autoDismiss: false });
      updateFeedback({
        operations: ops,
      });
      // Disable normalizer
      if (ops.length > 0) {
        controller.WithoutNormalizing(() => {
          for (const op of ops) {
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
      setAppliedOperations(true);
    },
    [controller, toast, updateFeedback]
  );

  const onProgress = useCallback(
    (event: NotebookAssistantEventProgress, elapsed: number) => {
      updateMessage({
        content: `${humanizeMotebookAssistantProgressMessage(event)}...`,
        status: 'pending',
      });
      updateFeedbackElaspedTime({
        [event.action]: elapsed,
      });
    },
    [updateMessage, updateFeedbackElaspedTime]
  );

  const onSummary = useCallback(
    (summary: string) => {
      updateFeedback({
        summary,
      });
      updateMessage({
        content: summary,
        status: 'success',
      });
      setHaveSummary(true);
    },
    [updateMessage, updateFeedback]
  );

  useEffect(() => {
    if (haveFatalError || (appliedOperations && haveSummary)) {
      onceDone();
    }
  }, [appliedOperations, haveFatalError, haveSummary, onceDone]);

  return useNotebookAssistant(notebookId, {
    onProgress,
    onError,
    onOperations,
    onPrompt,
    onSummary,
  });
};
