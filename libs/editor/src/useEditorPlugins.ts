import { ClientEventsContext } from '@decipad/client-events';
import { Computer } from '@decipad/computer';
import { MyPlatePlugin } from '@decipad/editor-types';
import { useContext, useMemo } from 'react';
import { UserInteraction } from '@decipad/react-contexts';
import { Subject } from 'rxjs';
import * as configuration from './configuration';

export interface CreateEditorProps {
  notebookId: string;
  readOnly: boolean;
  computer?: Computer;
  notebookTitle: string;
  onNotebookTitleChange: (newValue: string) => void;
  interactions: Subject<UserInteraction>;
}

export const useEditorPlugins = ({
  readOnly = false,
  computer,
  notebookTitle,
  onNotebookTitleChange,
  interactions,
}: CreateEditorProps): MyPlatePlugin[] | undefined => {
  const events = useContext(ClientEventsContext);

  return useMemo(
    () =>
      !computer || !events
        ? undefined
        : configuration.plugins({
            readOnly,
            computer,
            events,
            interactions,
            notebookTitle,
            onNotebookTitleChange,
          }),

    [
      computer,
      events,
      interactions,
      notebookTitle,
      onNotebookTitleChange,
      readOnly,
    ]
  );
};
