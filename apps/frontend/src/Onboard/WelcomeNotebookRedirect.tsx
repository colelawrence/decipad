import React from 'react';
import { useGetWorkspacesQuery } from '@decipad/graphql-client';
import { Navigate } from 'react-router-dom';
import { notebooks } from '@decipad/routing';
import { initialNotebook } from '@decipad/docsync';
import { LoadingLogo } from '@decipad/ui';

export const WelcomeNotebookRedirect: React.FC = () => {
  const [result] = useGetWorkspacesQuery({
    requestPolicy: 'cache-first',
  });

  if (result.fetching) {
    return <LoadingLogo />;
  }

  // Ugly solution, because it's even uglier when I do it on backend...
  // But at least we take name from initialNotebook so it has less chance to break
  const notebookIds =
    result.data?.workspaces?.flatMap((workspace) =>
      workspace?.pads.items.filter((pad) => pad.name === initialNotebook.title)
    ) ?? [];

  if (notebookIds?.length > 1) {
    throw new Error('More than one welcome notebook found');
  }

  if (notebookIds?.length < 1) {
    throw new Error('No welcome notebook found');
  }

  const notebook = notebookIds[0];
  const redirectTo = notebooks({}).notebook({
    notebook: { id: notebook.id, name: notebook.name },
  }).$;

  return <Navigate replace to={redirectTo} />;
};
