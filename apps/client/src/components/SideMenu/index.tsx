import { Spinner } from '@chakra-ui/react';
import { useGetWorkspaces } from '@decipad/queries';
import { useRouteParams, workspaces } from '@decipad/routing';
import { DashboardSidebar } from '@decipad/ui';
import { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { CreateWorkspace } from './CreateWorkspace';
import { WorkspacePreferences } from './WorkspacePreferences';

export const SideMenu = (): ReturnType<FC> => {
  const history = useHistory();
  const { workspaceId } = useRouteParams(workspaces({}).workspace);

  const { data } = useGetWorkspaces();
  if (!data) {
    return <Spinner />;
  }

  const currentWorkspace = data?.workspaces.find((w) => w.id === workspaceId);
  if (!currentWorkspace) {
    throw new Error(`Cannot find workspace ${workspaceId}`);
  }
  const currentWorkspaceRoute = workspaces({}).workspace({
    workspaceId: currentWorkspace.id,
  });

  const allOtherWorkspaces = data?.workspaces.filter(
    (w) => w.id !== workspaceId
  );

  return (
    <>
      <DashboardSidebar
        Heading="h1"
        activeWorkspace={{
          ...currentWorkspace,
          numberOfMembers: 1,
        }}
        otherWorkspaces={
          allOtherWorkspaces?.map((workspace) => ({
            ...workspace,
            href: workspaces({}).workspace({ workspaceId: workspace.id }).$,
            numberOfMembers: 1,
          })) ?? []
        }
        onCreateWorkspace={() =>
          history.push(currentWorkspaceRoute.createNew({}).$)
        }
      />
      <WorkspacePreferences />
      <CreateWorkspace Heading="h2" />
    </>
  );
};
