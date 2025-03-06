import { useMemo } from 'react';
import type { Computer } from '@decipad/computer-interfaces';
import type { MyPlatePlugin } from '@decipad/editor-types';
import type { UserInteraction } from '@decipad/react-contexts';
import type { Subject } from 'rxjs';
import * as configuration from './configuration';

export interface CreateEditorProps {
  computer?: Computer;
  interactions: Subject<UserInteraction>;
}

export const useEditorPlugins = ({
  computer,
  interactions,
}: CreateEditorProps): MyPlatePlugin[] | undefined => {
  return useMemo(
    () =>
      !computer
        ? undefined
        : configuration.plugins({
            computer,
            interactions,
          }),
    [computer, interactions]
  );
};
