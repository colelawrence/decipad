import { useContext, useMemo } from 'react';
import type { Computer } from '@decipad/computer-interfaces';
import type { MyPlatePlugin } from '@decipad/editor-types';
import type { UserInteraction } from '@decipad/react-contexts';
import type { Subject } from 'rxjs';
import { ClientEventsContext } from '@decipad/client-events';
import * as configuration from './configuration';

export interface CreateEditorProps {
  computer?: Computer;
  interactions: Subject<UserInteraction>;
}

export const useEditorPlugins = ({
  computer,
  interactions,
}: CreateEditorProps): MyPlatePlugin[] | undefined => {
  const events = useContext(ClientEventsContext);

  return useMemo(
    () =>
      !computer
        ? undefined
        : configuration.plugins({
            computer,
            events,
            interactions,
          }),
    [computer, events, interactions]
  );
};
