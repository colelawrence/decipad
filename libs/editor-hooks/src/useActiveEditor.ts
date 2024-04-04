import { useContext, useEffect, useState } from 'react';
import type {
  MyEditor,
  MinimalRootEditorWithEventsAndTabs,
} from '@decipad/editor-types';
import { useRouteParams } from 'typesafe-routes/react-router';
import { notebooks } from '@decipad/routing';
import { ControllerProvider } from '@decipad/react-contexts';
/**
 * Reactive hook that returns the existing tabs.
 */
/**
 * Returns the `MyEditor` object the user is currently looking at.
 */
export function useActiveEditor(
  controller: MinimalRootEditorWithEventsAndTabs | undefined
): MyEditor | undefined {
  const { tab } = useRouteParams(notebooks({}).notebook);

  const [editor, setEditor] = useState<MyEditor | undefined>(undefined);

  useEffect(() => {
    if (!controller) {
      setEditor(undefined);
      return;
    }

    setEditor(controller.getTabEditor(tab));
  }, [controller, tab]);

  return editor;
}

export function useEditorController():
  | MinimalRootEditorWithEventsAndTabs
  | undefined {
  return useContext(ControllerProvider);
}
