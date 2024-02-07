import { DocSyncEditor } from '@decipad/docsync';
import { MinimalRootEditorWithEventsAndTabs } from '@decipad/editor-types';
import { type FC } from 'react';
import { useNotebookStateAndActions, useTabNavigate } from './hooks';
import { NotebookTabs } from '@decipad/ui';

export interface TabsProps {
  readonly notebookId: string;
  readonly docsync: DocSyncEditor | undefined;
  readonly controller: MinimalRootEditorWithEventsAndTabs;
}

const Tabs: FC<TabsProps> = ({ notebookId, docsync, controller }) => {
  const { isReadOnly } = useNotebookStateAndActions({
    notebookId,
    docsync,
  });

  const { navigateToTab, tabs, tab, embed } = useTabNavigate(isReadOnly);
  const defaultTabId = tabs.at(0)?.id;

  if (tabs.length === 1 && isReadOnly) {
    return null;
  }

  return (
    <NotebookTabs
      tabs={tabs.map(({ id, name, icon, isHidden }) => ({
        id,
        name,
        icon,
        isHidden,
      }))}
      isEmbed={Boolean(embed)}
      isReadOnly={isReadOnly}
      activeTabId={tab ?? defaultTabId}
      onClick={navigateToTab}
      onCreateTab={() => {
        const newTabId = controller.insertTab();
        navigateToTab(newTabId);
        return newTabId;
      }}
      onRenameTab={controller.renameTab.bind(controller)}
      onDeleteTab={(id) => {
        // No deleting the last tab
        if (tabs.length <= 1) return;

        const tabIndex = tabs.findIndex((t) => t.id === id);

        controller.removeTab(id);
        if (id !== tab) return;

        // We are deleting the currently active tab.
        // We must navigate elsewhere
        const newSelectedTabIndex = tabs.at(tabIndex - 1) ?? tabs.at(0);

        if (newSelectedTabIndex?.id) {
          navigateToTab(newSelectedTabIndex.id);
        }
      }}
      onMoveTab={(id, index) => {
        const tabIndex = tabs.findIndex((t) => t.id === id);

        // check if tab exists
        if (tabIndex === -1) return;
        // check if tab is already in the correct position
        if (tabIndex === index) return;

        // check if index is not out of bounds
        if (index < 0 || index > tabs.length - 1) return;

        // how many operations we perform to get to the desired index
        const steps = Math.abs(index - tabIndex);
        // -1 -> left, 1 -> right
        const direction = Math.sign(index - tabIndex);

        for (let i = 1; i <= steps; i += 1) {
          const swapTab = tabs[tabIndex + i * direction];

          if (!swapTab) return;
          controller.moveTabs(id, swapTab.id);
        }
      }}
      onChangeIcon={controller.changeTabIcon.bind(controller)}
      onToggleShowHide={controller.toggleShowHideTab.bind(controller)}
    />
  );
};

export default Tabs;
