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
  readonly toggleAddNewVariable: () => void;
  readonly isFetching?: boolean;
  readonly sections: Array<WorkspaceSectionFragment>;
  readonly workspaceNotebooks: Array<WorkspaceNotebookFragment>;
  readonly actions: NotebookMetaActionsReturn;
}

export const NavigationSidebar: FC<NavigationSidebarProps> = ({
  workspaceId,
  children,
  notebookId,
  workspaces,
  search,
  setSearch,
  toggleAddNewVariable,
  isFetching,
  sections,
  workspaceNotebooks,
  actions,
}) => {
  if (isFetching) {
    return <Spinner />;
  }

  if (!sections) {
    return <>Could not get folder information</>;
  }

  return (
    <ErrorBoundary fallback={<></>}>
      <UINavigationSidebar
        notebookId={notebookId}
        sections={sections}
        numberCatalog={children}
        notebooks={workspaceNotebooks}
        workspaceId={workspaceId}
        workspaces={workspaces}
        toggleAddNewVariable={toggleAddNewVariable}
        search={search}
        setSearch={setSearch}
        actions={actions}
      />
    </ErrorBoundary>
  );
};
