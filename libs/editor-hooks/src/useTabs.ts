import {
  MinimalRootEditorWithEventsAndTabs,
  TabElement,
  TopLevelValue,
} from '@decipad/editor-types';
import { ControllerProvider } from '@decipad/react-contexts';
import { notebooks } from '@decipad/routing';
import { insertNodes } from '@udecode/plate-common';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouteParams } from 'typesafe-routes/react-router';

// eslint-disable-next-line no-underscore-dangle
function _useTabs(
  controller: MinimalRootEditorWithEventsAndTabs | undefined
): Array<TabElement> {
  const [, setRender] = useState(0);

  useEffect(() => {
    if (!controller) return;
    const sub = controller.events.subscribe((v) => {
      if (v.type !== 'new-tab' && v.type !== 'remove-tab') return;
      setRender((r) => r + 1);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [controller]);

  return (controller?.children.slice(1) as Array<TabElement>) ?? [];
}

/**
 * Wrapper for `useTabs` in `notebook-tabs`, so you don't need to
 * provide a controller.
 *
 * if `isReadOnly` is true, then hidden tabs will not be returned;
 */
export const useTabs = (isReadOnly?: boolean): ReturnType<typeof _useTabs> => {
  const controller = useContext(ControllerProvider);
  const tabs = _useTabs(controller);

  if (!isReadOnly) {
    return tabs;
  }

  return tabs.filter((t) => !t.isHidden);
};

/**
 * Returns an active tab id, or null if there is no active tab.
 */
export const useActiveTabId = (): string | undefined => {
  const controller = useContext(ControllerProvider);
  const tabs = _useTabs(controller);
  const { tab } = useRouteParams(notebooks({}).notebook);

  if (tabs.length === 0) return undefined;

  const activeTabId = !tab ? tabs[0].id : tabs.find((t) => t.id === tab)?.id;

  return activeTabId;
};

/**
 * Returns all tabs that are not the one the user is currently looking at.
 */
export const useFilteredTabs = (): ReturnType<typeof _useTabs> => {
  const controller = useContext(ControllerProvider);
  const tabs = _useTabs(controller);
  const activeTabId = useActiveTabId();

  return tabs.filter((t) => t.id !== activeTabId);
};

type MoveTabCallback = (tabId: string, node: TopLevelValue) => void;

export const useMoveToTab = (): MoveTabCallback => {
  const controller = useContext(ControllerProvider);

  const tabs = _useTabs(controller);
  const { tab } = useRouteParams(notebooks({}).notebook);

  const activeTabIndex = tab == null ? 0 : tabs.findIndex((t) => t.id === tab);

  const callback = useCallback(
    (tabId: string, node: TopLevelValue): void => {
      const tabIndex = tabs.findIndex((t) => t.id === tabId);
      if (tabIndex === -1) {
        throw new Error(
          'TabID could not be found in tabs, look out for parameters.'
        );
      }

      if (!controller) return;

      const editor = controller.getTabEditorAt(tabIndex);
      insertNodes(editor, node, { at: [editor.children.length - 1] });
    },
    [controller, tabs]
  );

  if (activeTabIndex === -1) {
    return () => {};
  }

  return callback;
};
