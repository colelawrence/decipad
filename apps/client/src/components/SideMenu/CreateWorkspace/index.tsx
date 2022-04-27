import { useMutation } from '@apollo/client';
import {
  CreateWorkspace as CreateWorkspaceResult,
  CreateWorkspaceVariables,
  CREATE_WORKSPACE,
} from '@decipad/queries';
import { useToast } from '@decipad/toast';
import { useRouteParams, workspaces } from '@decipad/routing';
import { CreateWorkspaceModal } from '@decipad/ui';
import { ComponentProps, FC } from 'react';
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
  const { workspaceId } = useRouteParams(workspaces({}).workspace);

  const toast = useToast();

  const [mutate] = useMutation<CreateWorkspaceResult, CreateWorkspaceVariables>(
    CREATE_WORKSPACE
  );

  const createNewWorkspace = (name: string) => {
    mutate({
      variables: { name },
      refetchQueries: ['GetWorkspaces'],
      awaitRefetchQueries: true,
    })
      .then((res) => {
        if (res.data) {
          history.push(
            workspaces({}).workspace({
              workspaceId: res.data.createWorkspace.id,
            }).$
          );
        } else {
          console.error('Missing created workspace data in response', res);
          toast('An error occurred while creating the workspace', 'error');
        }
      })
      .catch((err) => {
        console.error(err);
        toast('An error occurred while creating the workspace', 'error');
      });
  };

  return (
    <Route
      exact
      path={path + workspaces({}).workspace({ workspaceId }).createNew.template}
    >
      <CreateWorkspaceModal
        {...props}
        closeHref={url}
        onCreate={createNewWorkspace}
      />
    </Route>
  );
};
