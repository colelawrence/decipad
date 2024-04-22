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
  const notebookState = useNotebookState(notebookId);
  const parentHandler = useContext(ClientEventsContext);

  return useCallback(
    (event: HandleClientEventArgs) => {
      const { segmentEvent } = event;
      // Ignores all non-page events if the notebook is not loaded
      if (
        segmentEvent &&
        !(notebookState.loadedFromLocal || notebookState.loadedFromRemote) &&
        segmentEvent?.type !== 'page'
      ) {
        return Promise.resolve();
      }
      return parentHandler(event);
    },
    [notebookState, parentHandler]
  );
};
