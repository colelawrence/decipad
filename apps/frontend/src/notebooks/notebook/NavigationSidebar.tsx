import { DocSyncEditor } from '@decipad/docsync';
import {
  catalogDebounceTimeMs,
  catalogItems,
  groupByTab,
  NavigationSidebar as NavigationComponentSidebar,
  selectCatalogNames,
  toVar,
  useOnDragEnd,
} from '@decipad/editor-components';
import { useActiveEditor, useComputer } from '@decipad/editor-hooks';
import { onDragStartSmartRef } from '@decipad/editor-utils';
import { AutocompleteName } from '@decipad/language-interfaces';
import { useNotebookState } from '@decipad/notebook-state';
import { EditorController } from '@decipad/notebook-tabs';
import { WorkspaceInfo } from '@decipad/react-contexts';
import { NumberCatalog as UINumberCatalog } from '@decipad/ui';
import { ErrorBoundary } from '@sentry/react';

import { FC, useCallback, useMemo, useState } from 'react';

export interface NavigationSidebarProps {
  readonly notebookId: string;
  readonly workspaceInfo: WorkspaceInfo;
  readonly docsync?: DocSyncEditor;
}

const NavigationSidebar: FC<NavigationSidebarProps> = ({
  notebookId,
  workspaceInfo,
  docsync,
}) => {
  const editor = useActiveEditor();

  const onDragStart = useMemo(
    () => editor && onDragStartSmartRef(editor),
    [editor]
  );
  const onDragEnd = useOnDragEnd();

  const computer = useComputer();

  const [setAddVariable, setEditingVariable] = useNotebookState(
    notebookId,
    (s) => [s.setAddVariable, s.setEditingVariable] as const
  );

  const catalog = useMemo(
    () =>
      editor &&
      docsync &&
      catalogItems(editor, docsync as unknown as EditorController),
    [editor, docsync]
  );

  const items = computer.getNamesDefined$.useWithSelectorDebounced(
    catalogDebounceTimeMs,
    useCallback(
      (_items: AutocompleteName[]) => {
        return catalog ? catalog(selectCatalogNames(_items).map(toVar)) : [];
      },
      [catalog]
    )
  );

  const [search, setSearch] = useState('');

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  const groupedItems = useMemo(
    () => groupByTab(filteredItems),
    [filteredItems]
  );

  if (editor == null || docsync == null) {
    return null;
  }

  return (
    <ErrorBoundary fallback={<></>}>
      <NavigationComponentSidebar
        notebookId={notebookId}
        workspaceInfo={workspaceInfo}
        items={filteredItems}
        search={search}
        setSearch={setSearch}
      >
        <UINumberCatalog
          items={groupedItems}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          toggleAddNewVariable={setAddVariable}
          editVariable={setEditingVariable}
        />
      </NavigationComponentSidebar>
    </ErrorBoundary>
  );
};

export default NavigationSidebar;
