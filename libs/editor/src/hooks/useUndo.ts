import { useTEditorRef } from '@decipad/editor-types';
import { useWindowListener } from '@decipad/react-utils';
import { useCallback } from 'react';

export const useUndo = () => {
  const editor = useTEditorRef();
  useWindowListener(
    'keydown',
    useCallback(
      (event) => {
        if (event.metaKey || event.ctrlKey) {
          if (event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            editor.undo();
          } else if (
            event.key === 'Z' ||
            (event.key === 'z' && event.shiftKey)
          ) {
            event.preventDefault();
            event.stopPropagation();
            editor.redo();
          }
        }
      },
      [editor]
    )
  );
};
