import { useSyncExternalStore } from 'react';
import type { MyEditor } from '@decipad/editor-types';
import { useNotebookRoute } from '@decipad/routing';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { filter } from 'rxjs';
import { noop } from '@decipad/utils';

/**
 * Hook for getting the currently displayed sub editor for the tab.
 *
 * @note this uses the `useSyncExternalStore` hook, which is used in React,
 * when you have data that relies on some subscription.
 */
export function useActiveEditor(): MyEditor | undefined {
  const { tabId } = useNotebookRoute();
  const controller = useNotebookWithIdState((s) => s.controller);

  const tabEditor = useSyncExternalStore(
    (listener) => {
      if (controller == null) {
        return noop;
      }

      const sub = controller.events
        .pipe(filter((e) => e.type === 'new-tab-editor'))
        .subscribe(listener);

      return () => sub.unsubscribe();
    },
    () => controller?.getTabEditor(tabId)
  );

  return tabEditor;
}
