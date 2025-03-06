import { useEditorController } from '@decipad/notebook-state';
import { notebooks, useRouteParams } from '@decipad/routing';
import { useNavigate } from 'react-router-dom';
import { useTabs } from './useTabs';

export const useNavigateToDefinition = () => {
  const controller = useEditorController();
  const routeParams = useRouteParams(notebooks({}).notebook);
  const navigate = useNavigate();
  const tabs = useTabs(false);

  return (defBlockId: string | null | undefined) => {
    if (!defBlockId) return;

    const entry = controller.getEntryFromId(defBlockId);
    const tabIndex = (entry?.[1]?.[0] ?? 2) - 2;
    const tabId = tabs[tabIndex]?.id;

    if (!tabId) return;

    const notebookNav = notebooks({}).notebook;
    const url = `${
      notebookNav({ ...routeParams, tab: tabId }).$
    }#${defBlockId}`;

    navigate(url);
  };
};
