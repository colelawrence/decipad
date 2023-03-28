import { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { LoadingLogo } from '@decipad/ui';
import { useGetWorkspacesIDsQuery } from '@decipad/graphql-client';

const RedirectToDefaultWorkspace: FC = () => {
  const [results] = useGetWorkspacesIDsQuery();
  if (results.error) {
    throw results.error;
  }
  if (results.fetching) {
    return <LoadingLogo />;
  }
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
