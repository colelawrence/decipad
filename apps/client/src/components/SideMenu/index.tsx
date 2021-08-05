import { useQuery } from '@apollo/client';
import { DashboardSidebar } from '@decipad/ui';
import {
  GetWorkspaceById_getWorkspaceById,
  GET_WORKSPACES,
  GetWorkspaces,
} from '@decipad/queries';
import React, { FC, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { WorkspacePreferences } from './WorkspacePreferences';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export interface SideMenuProps {
  currentWorkspace: GetWorkspaceById_getWorkspaceById;
}

export const SideMenu = ({
  currentWorkspace,
}: SideMenuProps): ReturnType<FC> => {
  const history = useHistory();
  const { url } = useRouteMatch();

  const { data } = useQuery<GetWorkspaces>(GET_WORKSPACES);

  const allOtherWorkspaces = useMemo(
    () => data?.workspaces.filter((w) => w.id !== currentWorkspace.id),
    [currentWorkspace.id, data?.workspaces]
  );

  return (
    <>
      <DashboardSidebar
        Heading="h1"
        activeWorkspace={{
          ...currentWorkspace,
          href: `/workspaces/${currentWorkspace.id}`,
          numberOfMembers: 1,
        }}
        otherWorkspaces={
          allOtherWorkspaces?.map((workspace) => ({
            ...workspace,
            href: `/workspaces/${workspace.id}`,
            numberOfMembers: 1,
          })) ?? []
        }
        allNotebooksHref={url}
        preferencesHref={`/workspaces/${currentWorkspace.id}/preferences`}
        onCreateWorkspace={() =>
          history.push(`/workspaces/${currentWorkspace.id}/create-workspace`)
        }
      />
      <WorkspacePreferences currentWorkspace={currentWorkspace} />
      <CreateWorkspaceModal />
    </>
  );
};
