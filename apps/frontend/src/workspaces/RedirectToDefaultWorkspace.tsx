import { workspaces } from '@decipad/routing';
import { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from 'urql';

const RedirectToDefaultWorkspace: FC = () => {
  const [result] = useQuery({
    query: `
      query GetWorkspaces {
        workspaces {
          id
        }
      }
    `,
  });

  if (result.data?.workspaces?.[0] == null) {
    throw new Error('No workspaces found.');
  }

  const workspaceId = result.data.workspaces[0].id;
  return <Navigate replace to={workspaces({}).workspace({ workspaceId }).$} />;
};
export default RedirectToDefaultWorkspace;
