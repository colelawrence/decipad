import { useMemo } from 'react';
import type { MyEditor } from '@decipad/editor-types';
import { useNotebookRoute } from '@decipad/routing';
import { useNotebookWithIdState } from '@decipad/notebook-state';

export function useActiveEditor(): MyEditor | undefined {
  const { tabId } = useNotebookRoute();
  const controller = useNotebookWithIdState((s) => s.controller);

  return useMemo(() => {
    if (controller == null) {
      return undefined;
    }

    return controller.getTabEditor(tabId);
  }, [controller, tabId]);
}
