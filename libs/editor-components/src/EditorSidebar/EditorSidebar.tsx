import { useCallback, useContext, useMemo, useState } from 'react';
import { ClientEventsContext } from '@decipad/client-events';
import { useComputer } from '@decipad/editor-hooks';
import {
  EditorSidebarTab,
  type MyEditor,
  type SlashCommand,
} from '@decipad/editor-types';
import { onDragStartSmartRef } from '@decipad/editor-utils';
import { type AutocompleteName } from '@decipad/language-interfaces';
import { useNotebookState } from '@decipad/notebook-state';
import { EditorController } from '@decipad/notebook-tabs';
import { useNotebookMetaData } from '@decipad/react-contexts';
import {
  SlashCommandsMenu,
  EditorSidebar as UIEditorSidebar,
  NumberCatalog as UINumberCatalog,
} from '@decipad/ui';
import { ErrorBoundary } from '@sentry/react';
import type { FC, ReactElement } from 'react';
import { catalogDebounceTimeMs } from '../utils';
import { catalogItems } from '../utils/catalogItems';
import { groupByTab } from '../utils/groupByTab';
import { selectCatalogNames } from '../utils/selectCatalogNames';
import { execute } from '../utils/slashCommands';
import { toVar } from '../utils/toVar';
import { useOnDragEnd } from '../utils/useDnd';
import {
  blockSelectionStore,
  useBlockSelectionSelectors,
} from '@udecode/plate-selection';
import { FormattingTab } from '../FormattingTab';
import { assert } from '@decipad/utils';

interface EditorSidebarProps {
  notebookId: string;
  editor: MyEditor;
  controller: EditorController;
  formattingTabForm: ReactElement | null;
}

export const EditorSidebar: FC<EditorSidebarProps> = ({
  notebookId,
  editor,
  controller,
  formattingTabForm,
}) => {
  const notebookMetaData = useNotebookMetaData();
  assert(notebookMetaData.sidebarComponent.type === 'default-sidebar');
  const { selectedTab = 'block' } = notebookMetaData.sidebarComponent;
  const setSelectedTab = useCallback(
    (tab: EditorSidebarTab) =>
      notebookMetaData.setSidebar({
        type: 'default-sidebar',
        selectedTab: tab,
      }),
    [notebookMetaData]
  );

  const onDragStart = useMemo(() => onDragStartSmartRef(editor), [editor]);
  const onDragEnd = useOnDragEnd();

  const computer = useComputer();

  const clientEvent = useContext(ClientEventsContext);

  const [setAddVariable, setEditingVariable] = useNotebookState(
    notebookId,
    (s) => [s.setAddVariable, s.setEditingVariable] as const
  );

  const selectedIds = useBlockSelectionSelectors().selectedIds() as Set<string>;

  const onSetEditingVariable = useCallback(
    (id: string) => {
      setEditingVariable(id);
      blockSelectionStore.set.selectedIds(new Set([id]));
    },
    [setEditingVariable]
  );

  const catalog = useMemo(
    () => catalogItems(editor, controller),
    [editor, controller]
  );

  const items = computer.getNamesDefined$.useWithSelectorDebounced(
    catalogDebounceTimeMs,
    (_items: AutocompleteName[]) => {
      return catalog(selectCatalogNames(_items).map(toVar));
    }
  );

  const myOnExec = useCallback(
    (command: string) => {
      const elementPath =
        editor &&
        (editor.selection?.anchor.path || [editor.children.length - 1]);

      if (elementPath) {
        execute({
          editor,
          computer,
          path: elementPath.slice(0, 1),
          command: command as SlashCommand,
          deleteBlock: false,
          getAvailableIdentifier:
            computer.getAvailableIdentifier.bind(computer),
        });
      }
      clientEvent({
        segmentEvent: {
          type: 'action',
          action: 'sidebar block add',
          props: { command },
        },
      });
    },
    [clientEvent, computer, editor]
  );

  const [search, setSearch] = useState('');

  const filteredTransformedItems = useMemo(
    () =>
      items
        .map((i) => {
          if (selectedIds.has(i.blockId)) {
            // eslint-disable-next-line no-param-reassign
            i.isSelected = true;
          }
          return i;
        })
        .filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        ),
    [items, search, selectedIds]
  );

  const groupedItems = useMemo(
    () => groupByTab(filteredTransformedItems),
    [filteredTransformedItems]
  );

  return (
    <ErrorBoundary fallback={<></>}>
      <UIEditorSidebar
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        items={filteredTransformedItems}
        search={search}
        setSearch={setSearch}
        {...notebookMetaData}
      >
        <UINumberCatalog
          items={groupedItems}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          toggleAddNewVariable={setAddVariable}
          editVariable={onSetEditingVariable}
        />
        <SlashCommandsMenu
          variant="inline"
          onExecute={myOnExec}
          search={search}
        />
        <FormattingTab form={formattingTabForm} />
      </UIEditorSidebar>
    </ErrorBoundary>
  );
};
