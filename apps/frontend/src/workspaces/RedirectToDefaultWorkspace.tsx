import { workspaces } from '@decipad/routing';
import { captureException } from '@sentry/browser';
import { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from 'urql';
import { useCreateWorkspaceMutation } from '../graphql';

const RedirectToDefaultWorkspace: FC = () => {
  const createWorkspace = useCreateWorkspaceMutation()[1];
  const [result] = useQuery({
    query: `
      query GetWorkspaces {
        workspaces {
          id
        }
      }
    `,
  });

  let workspaceId;

  if (result.data?.workspaces?.[0] == null) {
    createWorkspace({ name: 'Personal' })
      .then((res) => {
        if (res.data) {
          workspaceId = res.data.createWorkspace.id;
        } else {
          console.error(
            'Failed to create workspace. Received empty response.',
            res
          );
          throw new Error('No workspaces found. Please contact support');
        }
      })
      .catch(captureException);
  } else {
    workspaceId = result.data.workspaces[0].id;
  }

  return <Navigate replace to={workspaces({}).workspace({ workspaceId }).$} />;
};
export default RedirectToDefaultWorkspace;
