import { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { LoadingLogo } from '@decipad/ui';
import { useLocalStorage } from '@decipad/react-utils';
import {
  useGetWorkspacesIDsQuery,
  GetWorkspacesIDsQuery,
} from '@decipad/graphql-client';

export const SELECTED_WORKSPACE_KEY = 'selectedWorkspace';

const RedirectToDefaultWorkspace: FC = () => {
  const [results] = useGetWorkspacesIDsQuery();
  const [selectedWorkspace] = useLocalStorage(SELECTED_WORKSPACE_KEY, '');

  const allWorkspaces = results.data?.workspaces || [];

  if (results.error) {
    throw results.error;
  }
  if (results.fetching) {
    return <LoadingLogo />;
  }

  const workspaceId =
    findExistingWorkspace(selectedWorkspace, allWorkspaces) ||
    findWorkspaceWithWritePermissions(allWorkspaces);

  if (!workspaceId) {
    throw new Error('No user workspaces with write permissions found');
  }

  return <Navigate replace to={workspaces({}).workspace({ workspaceId }).$} />;
};

const findExistingWorkspace = (
  workspaceId: string,
  allWorkspaces: GetWorkspacesIDsQuery['workspaces']
): string | undefined => {
  const exists = allWorkspaces.some((ws) => ws.id === workspaceId);
  return exists ? workspaceId : undefined;
};

const findWorkspaceWithWritePermissions = (
  allWorkspaces: GetWorkspacesIDsQuery['workspaces']
): string | undefined =>
  allWorkspaces.find(
    (ws) => ws.myPermissionType != null && ws.myPermissionType !== 'READ'
  )?.id;

export default RedirectToDefaultWorkspace;
