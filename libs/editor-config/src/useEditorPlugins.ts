import { useContext, useEffect, useMemo, useRef } from 'react';
import { Computer } from '@decipad/computer';
import { MyPlatePlugin } from '@decipad/editor-types';
import type { UserInteraction } from '@decipad/react-contexts';
import { Subject } from 'rxjs';
import { ClientEventsContext } from '@decipad/client-events';
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

  const title = useRef(notebookTitle);

  useEffect(() => {
    if (title.current !== notebookTitle) {
      title.current = notebookTitle;
    }
  }, [notebookTitle]);

  return useMemo(
    () =>
      !computer
        ? undefined
        : configuration.plugins({
            readOnly,
            computer,
            events,
            interactions,
            notebookTitle: title.current,
            onNotebookTitleChange,
          }),
    [computer, events, interactions, onNotebookTitleChange, readOnly]
  );
};
