import { useMutation } from '@apollo/client';
import {
  CreateWorkspace as CreateWorkspaceResult,
  CreateWorkspaceVariables,
  CREATE_WORKSPACE,
} from '@decipad/queries';
import { useToast } from '@decipad/react-contexts';
import { CreateWorkspaceModal } from '@decipad/ui';
import React, { ComponentProps, FC } from 'react';
import { Route, useHistory, useRouteMatch } from 'react-router-dom';

type CreateWorkspaceProps = Pick<
  ComponentProps<typeof CreateWorkspaceModal>,
  'Heading'
>;

export const CreateWorkspace = (
  props: CreateWorkspaceProps
): ReturnType<FC> => {
  const { path, url } = useRouteMatch();
  const history = useHistory();

  const toast = useToast();

  const [mutate] =
    useMutation<CreateWorkspaceResult, CreateWorkspaceVariables>(
      CREATE_WORKSPACE
    );

  const createNewWorkspace = (name: string) => {
    mutate({
      variables: { name },
      refetchQueries: ['GetWorkspaces'],
      awaitRefetchQueries: true,
    })
      .then((res) => {
        history.push(`../${res.data?.createWorkspace.id}`);
      })
      .catch((err) => {
        console.error(err);
        toast('An error occurred while creating the workspace', 'error');
      });
  };

  return (
    <Route exact path={`${path}/create-workspace`}>
      <CreateWorkspaceModal
        {...props}
        closeHref={url}
        onCreate={createNewWorkspace}
      />
    </Route>
  );
};
