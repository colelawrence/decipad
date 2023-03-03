import { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { useGetWorkspacesIDsQuery } from '../graphql';

const RedirectToDefaultWorkspace: FC = () => {
  const [results] = useGetWorkspacesIDsQuery();
  const firstWorkspaceWithWritePermissions = results.data?.workspaces.filter(
    (ws) => ws.myPermissionType != null && ws.myPermissionType !== 'READ'
  )[0];
  if (!firstWorkspaceWithWritePermissions) {
    throw new Error('No user workspaces with write permissions found');
  }
  return (
    <Navigate
      replace
      to={
        workspaces({}).workspace({
          workspaceId: firstWorkspaceWithWritePermissions.id,
        }).$
      }
    />
  );
};

export default RedirectToDefaultWorkspace;
