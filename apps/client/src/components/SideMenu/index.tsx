import { Spinner } from '@chakra-ui/react';
import { useGetWorkspaces } from '@decipad/queries';
import { DashboardSidebar } from '@decipad/ui';
import { FC } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { WorkspacePreferences } from './WorkspacePreferences';

export interface SideMenuProps {
  workspaceId: string;
}

export const SideMenu = ({ workspaceId }: SideMenuProps): ReturnType<FC> => {
  const history = useHistory();
  const { url } = useRouteMatch();

  const { data } = useGetWorkspaces();
  if (!data) {
    return <Spinner />;
  }

  const currentWorkspace = data?.workspaces.find((w) => w.id === workspaceId);
  if (!currentWorkspace) {
    throw new Error(`Cannot find workspace ${workspaceId}`);
  }
  const allOtherWorkspaces = data?.workspaces.filter(
    (w) => w.id !== workspaceId
  );

  return (
    <>
      <DashboardSidebar
        Heading="h1"
        activeWorkspace={{
          ...currentWorkspace,
          href: `/w/${currentWorkspace.id}`,
          numberOfMembers: 1,
        }}
        otherWorkspaces={
          allOtherWorkspaces?.map((workspace) => ({
            ...workspace,
            href: `/w/${workspace.id}`,
            numberOfMembers: 1,
          })) ?? []
        }
        allNotebooksHref={url}
        preferencesHref={`/w/${currentWorkspace.id}/preferences`}
        onCreateWorkspace={() =>
          history.push(`/w/${currentWorkspace.id}/create-workspace`)
        }
      />
      <WorkspacePreferences currentWorkspace={currentWorkspace} />
      <CreateWorkspaceModal />
    </>
  );
};
