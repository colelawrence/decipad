import { useGetWorkspacesWithSharedNotebooksQuery } from '@decipad/graphql-client';
import { WorkspaceInfo } from '@decipad/react-contexts';
import {
  NumberCatalogItemType,
  Spinner,
  NavigationSidebar as UINavigationSidebar,
} from '@decipad/ui';
import { ErrorBoundary } from '@sentry/react';
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';

interface NavigationSidebarProps {
  readonly notebookId: string;
  readonly workspaceInfo: WorkspaceInfo;
  readonly items?: NumberCatalogItemType[];
  readonly children: ReactNode;
  readonly search: string;
  readonly setSearch: Dispatch<SetStateAction<string>>;
}

export const NavigationSidebar: FC<NavigationSidebarProps> = ({
  workspaceInfo,
  children,
}) => {
  // todo: this should be a query for only sections
  const [result] = useGetWorkspacesWithSharedNotebooksQuery();
  const { data, fetching } = result;
  const isFetching = fetching || !data;

  if (isFetching) {
    return <Spinner />;
  }

  const { workspaces } = data;
  const { id: workspaceId, name: workspaceName } = workspaceInfo;

  const sections = workspaces.find(
    (workspace) => workspace.id === workspaceId
  )?.sections;

  if (!sections) {
    return <></>;
  }

  return (
    <ErrorBoundary fallback={<></>}>
      <UINavigationSidebar
        sections={sections}
        folderName={workspaceName ?? 'Folders'}
        numberCatalog={children}
      />
    </ErrorBoundary>
  );
};
