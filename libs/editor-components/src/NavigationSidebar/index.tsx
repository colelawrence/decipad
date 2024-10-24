import {
  WorkspaceSwitcherWorkspaceFragment,
  WorkspaceNotebookFragment,
  WorkspaceSectionFragment,
} from '@decipad/graphql-client';
import { NotebookMetaActionsReturn } from '@decipad/interfaces';
import {
  NumberCatalogItemType,
  Spinner,
  NavigationSidebar as UINavigationSidebar,
} from '@decipad/ui';
import { ErrorBoundary } from '@sentry/react';
import { Dispatch, FC, ReactNode, SetStateAction } from 'react';

interface NavigationSidebarProps {
  readonly notebookId: string;
  readonly workspaceId: string;
  readonly items?: NumberCatalogItemType[];
  readonly children: ReactNode;
  readonly search: string;
  readonly setSearch: Dispatch<SetStateAction<string>>;
  readonly workspaces: Array<WorkspaceSwitcherWorkspaceFragment>;
  readonly actions: NotebookMetaActionsReturn;
  readonly toggleAddNewVariable: () => void;
  readonly isFetching?: boolean;
  readonly sections: Array<WorkspaceSectionFragment>;
  readonly workspaceNotebooks: Array<WorkspaceNotebookFragment>;
}

export const NavigationSidebar: FC<NavigationSidebarProps> = ({
  workspaceId,
  children,
  notebookId,
  workspaces,
  actions,
  search,
  setSearch,
  toggleAddNewVariable,
  isFetching,
  sections,
  workspaceNotebooks,
}) => {
  if (isFetching) {
    return <Spinner />;
  }

  if (!sections) {
    return <>Could not get folder information</>;
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
        toggleAddNewVariable={toggleAddNewVariable}
        search={search}
        setSearch={setSearch}
      />
    </ErrorBoundary>
  );
};
