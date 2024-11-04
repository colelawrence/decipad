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
import {
  useGetWorkspaceNotebooksQuery,
  useGetWorkspacesWithSharedNotebooksQuery,
  WorkspaceSwitcherWorkspaceFragment,
} from '@decipad/graphql-client';
import { NotebookMetaActionsReturn } from '@decipad/interfaces';
import { AutocompleteName } from '@decipad/language-interfaces';
import { useNotebookState } from '@decipad/notebook-state';
import { EditorController } from '@decipad/notebook-tabs';
import { NumberCatalog as UINumberCatalog } from '@decipad/ui';
import { ErrorBoundary } from '@sentry/react';
import {
  SQLBlockIntegration,
  IntegrationTypes,
} from 'libs/editor-types/src/integrations';

import { FC, useCallback, useMemo, useState } from 'react';

export interface NavigationSidebarProps {
  readonly notebookId: string;
  readonly workspaceId: string;
  readonly docsync?: DocSyncEditor;
  readonly workspaces: Array<WorkspaceSwitcherWorkspaceFragment>;
  readonly actions: NotebookMetaActionsReturn;
}

const NavigationSidebar: FC<NavigationSidebarProps> = ({
  notebookId,
  workspaceId,
  docsync,
  workspaces,
  actions,
}) => {
  const passedController = docsync as unknown as EditorController;
  const [result] = useGetWorkspacesWithSharedNotebooksQuery();
  const { data, fetching } = result;
  const isFetching = fetching || !data;
  const [wsNotebookResult] = useGetWorkspaceNotebooksQuery({
    variables: { workspaceId },
    pause: !workspaceId,
  });
  const editor = useActiveEditor();
  const itemsTypesForNumberCatalog = ['var'];

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

  const items = computer.getNamesDefined$
    .useWithSelectorDebounced(
      catalogDebounceTimeMs,
      useCallback(
        (_items: AutocompleteName[]) => {
          const mappedItems = _items.map((_item) => {
            let integrationProvider;
            const elementFromBlockId = passedController.findNodeById(
              _item.blockId ?? ''
            );
            if (elementFromBlockId?.integrationType) {
              const integType = (
                elementFromBlockId.integrationType as IntegrationTypes
              ).type;

              if (integType === 'mysql') {
                integrationProvider = (
                  elementFromBlockId.integrationType as SQLBlockIntegration
                ).provider;
              } else {
                integrationProvider = integType;
              }
            }

            return {
              ..._item,
              blockType: elementFromBlockId?.type,
              integrationProvider,
            };
          });

          return catalog
            ? catalog(selectCatalogNames(mappedItems).map(toVar))
            : [];
        },
        [catalog, passedController]
      )
    )
    .filter((item) => itemsTypesForNumberCatalog.includes(item.type));

  const sections = data?.workspaces?.find(
    (workspace) => workspace.id === workspaceId
  )?.sections;

  const [search, setSearch] = useState('');

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  const filteredNotebooks = useMemo(() => {
    const workspaceNotebooks = wsNotebookResult.data?.pads.items || [];
    return workspaceNotebooks.filter((nb) =>
      nb.name.toLowerCase().includes(search)
    );
  }, [search, wsNotebookResult.data?.pads.items]);

  const groupedItems = useMemo(
    () => groupByTab(filteredItems),
    [filteredItems]
  );

  if (editor == null || docsync == null) {
    return null;
  }

  return (
    <ErrorBoundary fallback={<>Could not get notebook list</>}>
      <NavigationComponentSidebar
        notebookId={notebookId}
        workspaceId={workspaceId}
        items={filteredItems}
        search={search}
        setSearch={setSearch}
        workspaces={workspaces}
        actions={actions}
        toggleAddNewVariable={setAddVariable}
        isFetching={isFetching}
        sections={sections || []}
        workspaceNotebooks={filteredNotebooks}
      >
        <UINumberCatalog
          items={groupedItems}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          editVariable={setEditingVariable}
        />
      </NavigationComponentSidebar>
    </ErrorBoundary>
  );
};

export default NavigationSidebar;
