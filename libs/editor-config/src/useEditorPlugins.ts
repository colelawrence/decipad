import { useContext, useMemo } from 'react';
import { Computer } from '@decipad/computer';
import { MyPlatePlugin } from '@decipad/editor-types';
import type { UserInteraction } from '@decipad/react-contexts';
import { Subject } from 'rxjs';
import { ClientEventsContext } from '@decipad/client-events';
import * as configuration from './configuration';

export interface CreateEditorProps {
  readOnly: boolean;
  computer?: Computer;
  interactions: Subject<UserInteraction>;
}

export const useEditorPlugins = ({
  readOnly = false,
  computer,
  interactions,
}: CreateEditorProps): MyPlatePlugin[] | undefined => {
  const events = useContext(ClientEventsContext);

  return useMemo(
    () =>
      !computer
        ? undefined
        : configuration.plugins({
            readOnly,
            computer,
            events,
            interactions,
          }),
    [computer, events, interactions, readOnly]
  );
};
