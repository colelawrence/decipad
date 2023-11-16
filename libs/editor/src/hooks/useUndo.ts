import { EditorController } from '@decipad/notebook-tabs';
import { useWindowListener } from '@decipad/react-utils';
import { useCallback } from 'react';

export const useUndo = (controller: EditorController) => {
  useWindowListener(
    'keydown',
    useCallback(
      (event) => {
        if (event.metaKey || event.ctrlKey) {
          if (event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            controller.Undo();
          } else if (
            event.key === 'Z' ||
            (event.key === 'z' && event.shiftKey)
          ) {
            event.preventDefault();
            event.stopPropagation();
            controller.Redo();
          }
        }
      },
      [controller]
    )
  );
};
