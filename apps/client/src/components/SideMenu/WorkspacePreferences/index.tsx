import { Route, useHistory, useRouteMatch } from 'react-router-dom';
import {
  GetWorkspaces,
  GET_WORKSPACES,
  useDeleteWorkspace,
  useRenameWorkspace,
} from '@decipad/queries';
import React, { FC } from 'react';
import { EditWorkspaceModal } from '@decipad/ui';
import { useQuery } from '@apollo/client';
import { Spinner } from '@chakra-ui/react';
import { useToast } from '@decipad/react-contexts';
import {
  useRouteParams,
  workspaces as workspacesRoute,
} from '@decipad/routing';

export const WorkspacePreferences = (): ReturnType<FC> => {
  const history = useHistory();
  const { path, url } = useRouteMatch();
  const { workspaceId } = useRouteParams(workspacesRoute({}).workspace);

  const toast = useToast();

  const [renameWorkspace] = useRenameWorkspace();
  const [deleteWorkspace] = useDeleteWorkspace();

  const { data: { workspaces } = {} } = useQuery<GetWorkspaces>(GET_WORKSPACES);
  if (!workspaces) {
    return <Spinner />;
  }

  const currentWorkspace = workspaces.find(({ id }) => id === workspaceId);
  if (!currentWorkspace) {
    console.error(
      'Cannot find workspace with id',
      workspaceId,
      'in list of workspaces',
      workspaces
    );
    throw new Error(`Cannot find workspace with id ${workspaceId}`);
  }

  return (
    <Route
      path={path + workspacesRoute({}).workspace({ workspaceId }).edit.template}
    >
      <EditWorkspaceModal
        Heading="h1"
        name={currentWorkspace.name}
        allowDelete={workspaces.length > 1}
        closeHref={url}
        onRename={(newName) =>
          renameWorkspace({ variables: { id: workspaceId, name: newName } })
            .then(() => {
              history.push(url);
            })
            .catch((err) => {
              console.error('Failed to rename workspace. Error:', err);
              toast('Failed to rename workspace.', 'error');
            })
        }
        onDelete={() => {
          history.push('/');
          return deleteWorkspace({ variables: { id: workspaceId } })
            .then(() => {
              toast('Workspace deleted.', 'success');
            })
            .catch((err) => {
              console.error('Failed to delete workspace. Error:', err);
              toast('Failed to delete workspace.', 'error');
            });
        }}
      />
    </Route>
  );
};
