import { createContext, useContext, useEffect, useState } from 'react';
import { EditorController } from './EditorController';
import { MyEditor, TabElement } from '@decipad/editor-types';
import { useRouteParams } from 'typesafe-routes/react-router';
import { notebooks } from '@decipad/routing';

export const ControllerProvider = createContext<EditorController | undefined>(
  undefined
);

/**
 * Reactive hook that returns the existing tabs.
 */
export function useTabs(
  controller: EditorController | undefined
): Array<TabElement> {
  const [, setRender] = useState(0);

  useEffect(() => {
    if (!controller) return;
    const sub = controller.Notifier.subscribe((v) => {
      if (v !== 'new-tab' && v !== 'remove-tab') return;
      setRender((r) => r + 1);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [controller]);

  return (controller?.children.slice(1) as Array<TabElement>) ?? [];
}

/**
 * Returns the `MyEditor` object the user is currently looking at.
 */
export function useActiveEditor(
  controller: EditorController | undefined
): MyEditor | undefined {
  const { tab } = useRouteParams(notebooks({}).notebook);

  if (!controller) return undefined;

  return tab
    ? controller.SubEditors.find((e) => e.id === tab)
    : controller.SubEditors[0];
}

export function useEditorController(): EditorController | undefined {
  return useContext(ControllerProvider);
}
