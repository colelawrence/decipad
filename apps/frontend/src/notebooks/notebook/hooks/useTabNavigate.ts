import { useTabs } from '@decipad/editor-hooks';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { notebooks } from '@decipad/routing';
import { useRouteParams } from 'typesafe-routes/react-router';

export interface UseTabNavigateResult {
  navigateToTab: (tabId: string) => void;
  changeNotebookTitle: (newTitle: string) => void;
  tab?: string;
  tabs: ReturnType<typeof useTabs>;
  embed?: boolean;
}

export const useTabNavigate = (isReadOnly: boolean): UseTabNavigateResult => {
  const tabs = useTabs(isReadOnly);
  const routeParams = useRouteParams(notebooks({}).notebook);
  const nav = useNavigate();

  const defaultTabId = tabs.at(0)?.id;

  const notebookNav = notebooks({}).notebook;
  const go = useCallback(
    (params: Partial<Parameters<typeof notebookNav>[0]>, replace = false) => {
      nav(`${notebookNav({ ...routeParams, ...params }).$}`, { replace });
    },
    [nav, notebookNav, routeParams]
  );

  useEffect(() => {
    if (!routeParams.tab && defaultTabId) {
      go({ tab: defaultTabId }, true);
    }
  }, [defaultTabId, go, routeParams.tab]);

  const navigateToTab = useCallback(
    (tabId: string) => {
      go({ tab: tabId });
    },
    [go]
  );

  const changeNotebookTitle = useCallback(
    (newTitle: string) => {
      go(
        {
          notebook: {
            ...routeParams.notebook,
            name: newTitle,
          },
        },
        true
      );
    },
    [go, routeParams.notebook]
  );

  return useMemo(
    () => ({
      ...routeParams,
      tabs,
      navigateToTab,
      changeNotebookTitle,
    }),
    [changeNotebookTitle, navigateToTab, routeParams, tabs]
  );
};
