import { TopLevelValue } from '@decipad/editor-types';
import {
  ControllerProvider,
  useTabs as _useTabs,
} from '@decipad/notebook-tabs';
import { notebooks } from '@decipad/routing';
import { insertNodes } from '@udecode/plate';
import { useCallback, useContext } from 'react';
import { useRouteParams } from 'typesafe-routes/react-router';
/**
 * Wrapper for `useTabs` in `notebook-tabs`, so you don't need to
 * provide a controller.
 */
export const useTabs = (): ReturnType<typeof _useTabs> => {
  const controller = useContext(ControllerProvider);
  return _useTabs(controller);
};

/**
 * Returns an active tab id, or null if there is no active tab.
 */
export const useActiveTabId = (): string | null => {
  const controller = useContext(ControllerProvider);
  const tabs = _useTabs(controller);
  const { tab } = useRouteParams(notebooks({}).notebook);

  if (tabs.length === 0) return null;

  const activeTabId = !tab ? tabs[0].id : tabs.find((t) => t.id === tab)?.id;

  if (!activeTabId) {
    throw new Error(
      'Tab ID must always be found, there is likely a disconnect between URL param and tabID'
    );
  }

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

      const editor = controller.SubEditors[tabIndex];
      insertNodes(editor, node, { at: [editor.children.length - 1] });
    },
    [controller, tabs]
  );

  if (activeTabIndex === -1) {
    return () => {};
  }

  return callback;
};
