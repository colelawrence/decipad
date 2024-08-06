import type {
  ClientEventContextType,
  HandleClientEventArgs,
} from '@decipad/client-events';
import { ClientEventsContext } from '@decipad/client-events';
import { useNotebookState } from '@decipad/notebook-state';
import { useCallback, useContext } from 'react';

export const useEditorClientEvents = (
  notebookId: string
): ClientEventContextType => {
  const [loadedFromLocal, loadedFromRemote] = useNotebookState(
    notebookId,
    (s) => [s.loadedFromLocal, s.loadedFromRemote] as const
  );
  const parentHandler = useContext(ClientEventsContext);

  return useCallback(
    (event: HandleClientEventArgs) => {
      const { segmentEvent } = event;
      // Ignores all non-page events if the notebook is not loaded
      if (
        segmentEvent &&
        !(loadedFromLocal || loadedFromRemote) &&
        segmentEvent?.type !== 'page'
      ) {
        return Promise.resolve();
      }
      return parentHandler(event);
    },
    [loadedFromLocal, loadedFromRemote, parentHandler]
  );
};
