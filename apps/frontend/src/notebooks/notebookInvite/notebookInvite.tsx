import { FC, useEffect, useState } from 'react';
import { notebooks, useRouteParams } from '@decipad/routing';
import { Navigate } from 'react-router-dom';
import { LoadingLogo } from '@decipad/ui';
import { useGetNotebookByIdQuery } from '@decipad/graphql-client';

const getInviteAcceptUrl = (inviteId: string) =>
  `${window.location.origin}/api/invites/${inviteId}/accept`;

// FIXME: urql does not export this type, so we have to create it:
interface GraphqlError extends Error {
  code?: string;
  extensions?: {
    code?: string;
  };
}

const NotebookInvite: FC = () => {
  const [inviteAccepted, setInviteAccepted] = useState(false);

  const {
    notebook: { id: notebookId },
    invite: { id: inviteId },
  } = useRouteParams(notebooks({}).acceptInvite);

  const [getNotebookResult, refetchNotebook] = useGetNotebookByIdQuery({
    variables: { id: notebookId },
  });

  const isForbiddenError = (e: GraphqlError) => {
    if (e.extensions?.code === 'FORBIDDEN') {
      return true;
    }
    const message = e.message.toLowerCase();
    return message.includes('forbidden') || message.includes('could not find');
  };

  const isLoaded = !getNotebookResult.fetching;
  const accessLevel = getNotebookResult.data?.getPadById?.myPermissionType;
  const forbiddenError =
    getNotebookResult.error?.graphQLErrors.find(isForbiddenError);

  const shouldRedirect = accessLevel != null && forbiddenError == null;
  const shouldAcceptInvite =
    isLoaded &&
    !inviteAccepted &&
    (accessLevel == null || forbiddenError != null);

  useEffect(() => {
    if (shouldAcceptInvite) {
      const inviteUrl = getInviteAcceptUrl(inviteId);
      fetch(inviteUrl, {
        method: 'GET',
        credentials: 'same-origin',
      }).then((res) => {
        if (res.ok) {
          setInviteAccepted(true);
          refetchNotebook({
            variables: { id: notebookId },
          });
        } else {
          console.error('Failed to accept invite', res);
        }
      });
    }
  }, [inviteId, notebookId, refetchNotebook, shouldAcceptInvite]);

  if (!isLoaded) return <LoadingLogo />;
  if (shouldRedirect) {
    return <Navigate replace to={`${notebooks({}).$}/${notebookId}`} />;
  }

  return <LoadingLogo />;
};

export default NotebookInvite;
