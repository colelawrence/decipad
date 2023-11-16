/* eslint-disable prefer-template */
import { FC } from 'react';
import { useGetWorkspacesQuery } from '@decipad/graphql-client';
import { Navigate } from 'react-router-dom';
import { notebooks, workspaces } from '@decipad/routing';
import { LoadingLogo } from '@decipad/ui';
import { InitialNotebook } from '@decipad/notebook-tabs';

export const WelcomeNotebookRedirect: FC = () => {
  const [result] = useGetWorkspacesQuery({
    requestPolicy: 'cache-first',
  });

  if (result.fetching) {
    return <LoadingLogo />;
  }

  let redirectTo = workspaces({}).$;

  // Ugly solution, because it's even uglier when I do it on backend...
  // But at least we take name from initialNotebook so it has less chance to break
  const notebookIds =
    result.data?.workspaces?.flatMap((workspace) =>
      workspace?.pads.items.filter((pad) => pad.name === InitialNotebook.title)
    ) ?? [];

  if (notebookIds.length === 1) {
    const notebook = notebookIds[0];
    redirectTo = notebooks({}).notebook({
      notebook: { id: notebook.id, name: notebook.name },
    }).$;
  } else {
    console.warn('Weird number of welcome notebooks: ' + notebookIds.length);
  }

  return <Navigate replace to={redirectTo} />;
};
