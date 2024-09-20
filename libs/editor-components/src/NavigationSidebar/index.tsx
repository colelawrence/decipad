import {
  useGetWorkspaceNotebooksQuery,
  useGetWorkspacesWithSharedNotebooksQuery,
  WorkspaceSwitcherWorkspaceFragment,
} from '@decipad/graphql-client';
import { NotebookMetaActionsReturn } from '@decipad/interfaces';
import {
  NumberCatalogItemType,
  Spinner,
  NavigationSidebar as UINavigationSidebar,
} from '@decipad/ui';
import { ErrorBoundary } from '@sentry/react';
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';

interface NavigationSidebarProps {
  readonly notebookId: string;
  readonly workspaceId: string;
  readonly items?: NumberCatalogItemType[];
  readonly children: ReactNode;
  readonly search: string;
  readonly setSearch: Dispatch<SetStateAction<string>>;
  readonly workspaces: Array<WorkspaceSwitcherWorkspaceFragment>;
  readonly actions: NotebookMetaActionsReturn;
}

export const NavigationSidebar: FC<NavigationSidebarProps> = ({
  workspaceId,
  children,
  notebookId,
  workspaces,
  actions,
}) => {
  // todo: this should be a query for only sections
  const [result] = useGetWorkspacesWithSharedNotebooksQuery();
  const { data, fetching } = result;
  const isFetching = fetching || !data;
  const [wsNotebookResult] = useGetWorkspaceNotebooksQuery({
    variables: { workspaceId: workspaceId ?? '' },
  });

  if (isFetching) {
    return <Spinner />;
  }

  // change this if we need to support pagination in the future
  const workspaceNotebooks = wsNotebookResult.data?.pads.items;

  const sections = data.workspaces.find(
    (workspace) => workspace.id === workspaceId
  )?.sections;

  if (!sections) {
    return <></>;
  }

  const onDuplicate = (wsId: string) => {
    actions.onDuplicateNotebook(notebookId, wsId);
  };

  return (
    <ErrorBoundary fallback={<></>}>
      <UINavigationSidebar
        notebookId={notebookId}
        sections={sections}
        numberCatalog={children}
        notebooks={workspaceNotebooks}
        workspaceId={workspaceId}
        workspaces={workspaces}
        onDuplicate={onDuplicate}
        actions={actions}
      />
    </ErrorBoundary>
  );
};
