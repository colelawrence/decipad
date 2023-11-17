import { useWindowListener } from '@decipad/react-utils';
import { useCallback } from 'react';
import { WithUndo } from '@decipad/editor-types';

export const useUndo = (controller: WithUndo) => {
  useWindowListener(
    'keydown',
    useCallback(
      (event) => {
        if (event.metaKey || event.ctrlKey) {
          if (event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            controller.undo();
          } else if (
            event.key === 'Z' ||
            (event.key === 'z' && event.shiftKey)
          ) {
            event.preventDefault();
            event.stopPropagation();
            controller.redo();
          }
        }
      },
      [controller]
    )
  );
};
