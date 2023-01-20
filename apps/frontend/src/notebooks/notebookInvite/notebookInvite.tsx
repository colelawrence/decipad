import { FC, useEffect, useState } from 'react';
import { notebooks, useRouteParams } from '@decipad/routing';
import { Navigate } from 'react-router-dom';
import { LoadingLogo } from '@decipad/ui';
import { useGetNotebookByIdQuery } from '../../graphql';

const getInviteAcceptUrl = (inviteId: string) =>
  `${window.location.origin}/api/invites/${inviteId}/accept`;

const NotebookInvite: FC = () => {
  const [inviteAccepted, setInviteAccepted] = useState(false);

  const {
    notebook: { id: notebookId },
    invite: { id: inviteId },
  } = useRouteParams(notebooks({}).acceptInvite);

  const [getNotebookResult, refetchNotebook] = useGetNotebookByIdQuery({
    variables: { id: notebookId },
    requestPolicy: 'network-only',
  });

  const isLoaded = !getNotebookResult.fetching;
  const accessLevel = getNotebookResult.data?.getPadById?.myPermissionType;
  const forbiddenError = getNotebookResult.error?.graphQLErrors.find(
    (e) => e.extensions?.code === 'FORBIDDEN'
  );

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
