/* eslint-disable camelcase */
import { FC } from 'react';
import { SidebarComponentProps } from './types';
import { NotebookPublishingPopUp } from '@decipad/ui';
import {
  NotebookMetaDataFragment,
  Publish_State,
  useGetNotebookMetaQuery,
} from '@decipad/graphql-client';
import { useStripeCollaborationRules } from '@decipad/react-utils';
import { workspaces } from '@decipad/routing';
import {
  useNotebookAccessActions,
  useNotebookMetaActions,
} from '../../../hooks';
import { usePublishedVersionState } from '../hooks';

function getPublishingState(
  data?: NotebookMetaDataFragment | null
): Publish_State {
  if (data == null) {
    return 'PRIVATE';
  }

  if (data.userAllowsPublicHighlighting) {
    return 'PUBLICLY_HIGHLIGHTED';
  }

  if (data.isPublic) {
    return 'PUBLIC';
  }

  return 'PRIVATE';
}

const Publishing: FC<SidebarComponentProps> = ({ notebookId, docsync }) => {
  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

  const publishedVersionState = usePublishedVersionState({
    notebookId,
    docsync,
  });

  const actions = useNotebookMetaActions();
  const accessActions = useNotebookAccessActions();

  const data = meta.data?.getPadById;

  const manageTeamURL = data?.workspace
    ? workspaces({})
        .workspace({
          workspaceId: data.workspace.id,
        })
        .members({}).$
    : workspaces({}).$;

  const { canInvite } = useStripeCollaborationRules(
    data?.access.users,
    data?.workspace?.access?.users ?? []
  );

  if (meta.data == null || meta.data.getPadById == null) {
    return null;
  }

  const notebookName = data?.name ?? 'My Notebook';
  const isPremiumWorkspace = Boolean(data?.workspace?.isPremium);
  const hasPaywall = !canInvite && !isPremiumWorkspace;
  const publishingState = getPublishingState(data);

  return (
    <NotebookPublishingPopUp
      isPremium={isPremiumWorkspace}
      notebookName={notebookName}
      workspaceId={data?.workspace?.id ?? ''}
      hasPaywall={hasPaywall}
      invitedUsers={data?.access.users}
      nrOfTeamMembers={data?.workspace?.membersCount}
      manageTeamURL={manageTeamURL}
      teamName={data?.workspace?.name ?? ''}
      isAdmin={data?.myPermissionType === 'ADMIN'}
      snapshots={data?.snapshots ?? []}
      notebookId={notebookId}
      publishingState={publishingState}
      publishedVersionState={publishedVersionState}
      onUpdatePublish={actions.onUpdatePublishState}
      onPublish={actions.onPublishNotebook}
      onInvite={accessActions.onInviteByEmail}
      onChange={accessActions.onChangeAccess}
      onRemove={accessActions.onRemoveAccess}
    />
  );
};

export default Publishing;
