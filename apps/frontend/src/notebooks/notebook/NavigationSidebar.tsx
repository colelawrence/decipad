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
import { MyEditor } from '@decipad/editor-types';
import { onDragStartSmartRef } from '@decipad/editor-utils';
import {
  useGetNotebookByIdQuery,
  useGetWorkspaceNotebooksQuery,
  useGetWorkspacesWithSharedNotebooksQuery,
  WorkspaceNumber,
  WorkspaceSwitcherWorkspaceFragment,
} from '@decipad/graphql-client';
import { AutocompleteName } from '@decipad/language-interfaces';
import {
  useNotebookState,
  useNotebookWithIdState,
} from '@decipad/notebook-state';
import { EditorController } from '@decipad/notebook-tabs';
import { NumberCatalog as UINumberCatalog } from '@decipad/ui';
import {
  SQLBlockIntegration,
  IntegrationTypes,
} from 'libs/editor-types/src/integrations';
import { FC, memo, useCallback, useMemo, useState } from 'react';
import { ErrorBoundary } from '@sentry/react';
import { WorkspaceNumbers } from './WorkspaceNumbers';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useNotebookMetaActions } from '../../hooks';

type NavigationSidebarProps = {
  notebookId: string;
  workspaceId: string;
  workspaces: Array<WorkspaceSwitcherWorkspaceFragment>;
};

type DefinedNavigationSidebarProps = NavigationSidebarProps & {
  controller: EditorController;
  editor: MyEditor;

  workspaceNumbers: Array<WorkspaceNumber>;
};

//
// TODO:
//
// Lots of graphql requests here. They will waterfall.
//  1. Merge them into one request that contains all the info we need.
//  2. Seperate into seperate components with difference suspense barriers.
//
// Without this, we will get a very long cascading loading animation.
//

const DefinedNavigationSidebar: FC<DefinedNavigationSidebarProps> = memo(
  ({
    notebookId,
    workspaceId,
    workspaces,
    controller,
    editor,
    workspaceNumbers,
  }) => {
    const [result] = useGetWorkspacesWithSharedNotebooksQuery();
    const { data, fetching } = result;
    const isFetching = fetching || !data;

    const [wsNotebookResult] = useGetWorkspaceNotebooksQuery({
      variables: { workspaceId },
      pause: !workspaceId,
    });

    const actions = useNotebookMetaActions();

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
      () => catalogItems(editor, controller),
      [editor, controller]
    );

    const items = computer.getNamesDefined$
      .useWithSelectorDebounced(
        catalogDebounceTimeMs,
        useCallback(
          (_items: AutocompleteName[]) => {
            const mappedItems = _items.map((_item) => {
              let integrationProvider;

              const elementFromBlockId = _item.blockId
                ? controller.findNodeById(_item.blockId)
                : undefined;

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

            return catalog(selectCatalogNames(mappedItems).map(toVar));
          },
          [catalog, controller]
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
      const workspaceNotebooks = wsNotebookResult.data?.pads.items ?? [];
      return workspaceNotebooks.filter((nb) =>
        nb.name.toLowerCase().includes(search)
      );
    }, [search, wsNotebookResult.data?.pads.items]);

    const groupedItems = useMemo(
      () => groupByTab(filteredItems),
      [filteredItems]
    );

    return (
      <ErrorBoundary fallback={<>Could not get notebook list</>}>
        <NavigationComponentSidebar
          notebookId={notebookId}
          workspaceId={workspaceId}
          items={filteredItems}
          search={search}
          setSearch={setSearch}
          workspaces={workspaces}
          toggleAddNewVariable={setAddVariable}
          isFetching={isFetching}
          sections={sections ?? []}
          workspaceNotebooks={filteredNotebooks}
          actions={actions}
        >
          <UINumberCatalog
            items={groupedItems}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            editVariable={setEditingVariable}
          />
          {isFlagEnabled('WORKSPACE_NUMBERS') && (
            <WorkspaceNumbers
              controller={controller}
              workspaceNumbers={workspaceNumbers}
            />
          )}
        </NavigationComponentSidebar>
      </ErrorBoundary>
    );
  }
);

const NavigationSidebar: FC<NavigationSidebarProps> = memo((props) => {
  const editor = useActiveEditor();
  const controller = useNotebookWithIdState((s) => s.controller);

  const [{ data }] = useGetNotebookByIdQuery({
    variables: { id: props.notebookId },
  });

  const workspaceNumbers = data?.getPadById?.workspace?.workspaceNumbers;

  if (
    editor == null ||
    controller == null ||
    data == null ||
    workspaceNumbers == null
  ) {
    return null;
  }

  return (
    <DefinedNavigationSidebar
      {...props}
      editor={editor}
      controller={controller}
      workspaceNumbers={workspaceNumbers}
    />
  );
});

export default NavigationSidebar;
