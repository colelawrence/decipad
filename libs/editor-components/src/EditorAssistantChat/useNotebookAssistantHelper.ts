import type { ReplyAssistantMessage } from '@decipad/react-contexts';
import type { TOperation } from '@udecode/plate';
import { useCallback, useEffect, useState } from 'react';
import { useNotebookAssistant } from './useNotebookAssistant';
import { useToast } from '@decipad/toast';
import { EditorController } from '@decipad/notebook-tabs';

export interface NotebookAssistantHelperOptions {
  notebookId: string;
  updateMessage: (message: Partial<ReplyAssistantMessage>) => unknown;
  controller: EditorController;
  onceDone: () => unknown;
}

export const useNotebookAssistantHelper = ({
  notebookId,
  updateMessage,
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
      updateMessage({
        content: 'Error generating response',
        type: 'error',
      });
      setHaveFatalError(true);
    },
    [toast, updateMessage]
  );

  const onOperations = useCallback(
    (ops: TOperation[]) => {
      const toastId = toast.info('Applying changes...', { autoDismiss: false });

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
    [controller, toast]
  );

  const onProgress = useCallback(
    (progress: string) => {
      updateMessage({
        content: `${progress}...`,
        type: 'pending',
      });
    },
    [updateMessage]
  );

  const onSummary = useCallback(
    (summary: string) => {
      updateMessage({
        content: summary,
        type: 'success',
      });
      setHaveSummary(true);
    },
    [updateMessage]
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
    onSummary,
  });
};
