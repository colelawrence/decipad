/* eslint-disable prefer-template */
import { FC } from 'react';
import {
  useGetWorkspaceNotebooksQuery,
  useGetWorkspacesIDsQuery,
} from '@decipad/graphql-client';
import { Navigate } from 'react-router-dom';
import { notebooks, workspaces } from '@decipad/routing';
import { LoadingLogo } from '@decipad/ui';

const INITIAL_TITLE = 'Welcome to Decipad!';

type RedirectToWelcomeNotebookProps = {
  workspaceId: string;
};

const RedirectToWelcomeNotebook: FC<RedirectToWelcomeNotebookProps> = ({
  workspaceId,
}) => {
  const [results] = useGetWorkspaceNotebooksQuery({
    variables: { workspaceId },
  });

  if (results.fetching) {
    return <LoadingLogo />;
  }

  if (results.error) {
    throw results.error;
  }

  const notebook = results.data?.pads?.items?.find(
    (item) => item.name === INITIAL_TITLE
  );

  if (notebook) {
    return (
      <Navigate
        replace
        to={
          notebooks({}).notebook({
            notebook: { id: notebook.id, name: notebook.name },
          }).$
        }
      />
    );
  }

  return <Navigate replace to={workspaces({}).$} />;
};

export const WelcomeNotebookRedirect: FC = () => {
  const [results] = useGetWorkspacesIDsQuery({
    requestPolicy: 'cache-first',
  });

  const allWorkspaces = results.data?.workspaces || [];

  if (results.error) {
    throw results.error;
  }
  if (results.fetching) {
    return <LoadingLogo />;
  }

  // if we only have one workspace, we assume that we should show the welcome notebook
  if (allWorkspaces.length === 1) {
    return <RedirectToWelcomeNotebook workspaceId={allWorkspaces[0].id} />;
  }

  return <Navigate replace to={workspaces({}).$} />;
};
