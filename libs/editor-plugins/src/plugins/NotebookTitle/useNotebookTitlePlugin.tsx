import { MyOnChange, MyPlatePlugin } from '@decipad/editor-types';
import { getNodeEntry, getNodeString } from '@udecode/plate';
import { useCallback, useMemo, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export interface UseNotebookTitlePluginProps {
  readOnly: boolean;
  notebookTitle: string;
  onNotebookTitleChange: (newValue: string) => void;
}

export const useNotebookTitlePlugin = ({
  readOnly,
  notebookTitle,
  onNotebookTitleChange,
}: UseNotebookTitlePluginProps): MyPlatePlugin => {
  const lastNotebookTitle = useRef(notebookTitle);
  const onNotebookTitleChangeDebounced = useDebouncedCallback(
    onNotebookTitleChange,
    1000
  );

  const onChangeNotebookTitle: MyOnChange = useCallback(
    (editor) => () => {
      if (!readOnly) {
        const [node] = getNodeEntry(editor, [0, 0]);
        const newTitle = getNodeString(node);

        if (newTitle !== lastNotebookTitle.current) {
          lastNotebookTitle.current = newTitle;
          onNotebookTitleChangeDebounced(newTitle);
        }
      }
    },
    [readOnly, onNotebookTitleChangeDebounced]
  );

  // return a slate plugin
  return useMemo(
    () => ({
      key: 'ON_CHANGE_NOTEBOOK_TITLE_PLUGIN',
      handlers: {
        onChange: onChangeNotebookTitle,
      },
    }),
    [onChangeNotebookTitle]
  );
};
