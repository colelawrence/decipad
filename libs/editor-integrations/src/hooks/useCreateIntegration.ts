import type { MyEditor } from '@decipad/editor-types';
import { setSelection } from '@decipad/editor-utils';
import {
  useConnectionStore,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { insertNodes } from '@udecode/plate-common';
import { useEffect } from 'react';
import { getNewIntegration } from '../utils';
import { GenericContainerRunner } from '../runners';

/**
 * Used to create an integration with all its state in the editor
 */
export const useCreateIntegration = (
  editor: MyEditor,
  runner: GenericContainerRunner
) => {
  const createIntegration = useConnectionStore(
    (state) => state.createIntegration
  );

  const setSidebar = useNotebookMetaData((s) => s.setSidebar);

  useEffect(() => {
    if (createIntegration) {
      // Using getState because I don't want the hook to refresh when store is changing.
      const store = useConnectionStore.getState();

      if (!store.connectionType || !store.varName) return;

      if (store.connectionType == null || store.varName == null) {
        return;
      }

      const newIntegration = getNewIntegration(store.connectionType, runner);

      // 1 is the first thing after h1, shouldn't happen but
      const path = editor.selection?.anchor.path[0] || 1;
      insertNodes(editor, newIntegration, {
        at: [path],
      });

      const anchor = { offset: 0, path: [path, 0] };
      setTimeout(() => setSelection(editor, { anchor, focus: anchor }), 0);

      store.abort();
      setSidebar('closed');
    }
  }, [editor, createIntegration, runner, setSidebar]);
};
