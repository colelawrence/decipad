/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { FC, useCallback, useState } from 'react';
import { SidebarComponentProps } from './types';
import { NotebookPublishingPopUp } from '@decipad/ui';
import {
  NotebookMetaDataFragment,
  Publish_State,
  useGetNotebookMetaQuery,
} from '@decipad/graphql-client';
import { workspaces } from '@decipad/routing';
import {
  useNotebookAccessActions,
  useNotebookMetaActions,
} from '../../../hooks';
import { usePublishedVersionState } from '../hooks';
import {
  NotebookMetaActionsReturn,
  PublishedVersionState,
} from '@decipad/interfaces';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useStripeCollaborationRules } from '@decipad/react-utils';
import { useNotebookMetaData } from '@decipad/react-contexts';

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

interface PublicLocalActionsProps {
  readonly onUpdatePublishState: NotebookMetaActionsReturn['onUpdatePublishState'];
  readonly onPublishNotebook: NotebookMetaActionsReturn['onPublishNotebook'];
}

interface PublishLocalActionsReturn {
  readonly localPublishState: Publish_State | undefined;
  readonly setLocalPublishState: (state: Publish_State | undefined) => void;

  readonly onUpdatePublish: NotebookMetaActionsReturn['onUpdatePublishState'];
  readonly onPublish: NotebookMetaActionsReturn['onPublishNotebook'];
}

//
// Locally we need to hold on before sending backend requests.
// - When the user uses the dropdown to select "public",
// they must hit the "Publish" button before we actually set anything on the backend.
//
// - So we need a little local state.
//
// @note uses 'useGetNotebookMetaQuery'.
//
function usePublishLocalActions(
  notebookId: string,
  { onPublishNotebook, onUpdatePublishState }: PublicLocalActionsProps
): PublishLocalActionsReturn {
  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

  const publishingState = getPublishingState(meta.data?.getPadById);

  const [localPublishState, setLocalPublishState] = useState<
    Publish_State | undefined
  >(undefined);

  const onUpdatePublish = useCallback<
    NotebookMetaActionsReturn['onUpdatePublishState']
  >(
    async (id, state) => {
      if (publishingState === 'PRIVATE' && state !== 'PRIVATE') {
        // special logic.
        // We only want to update the backend AFTER the user clicks
        // "Publish" green button, so we need some frontend controls.

        setLocalPublishState(state);
        return;
      }

      setLocalPublishState(state);
      return onUpdatePublishState(id, state);
    },
    [onUpdatePublishState, publishingState]
  );

  const onPublish = useCallback<NotebookMetaActionsReturn['onPublishNotebook']>(
    async (id) => {
      if (localPublishState != null) {
        await onUpdatePublishState(id, localPublishState);
        setLocalPublishState(undefined);
      }

      return onPublishNotebook(id);
    },
    [localPublishState, onPublishNotebook, onUpdatePublishState]
  );

  return {
    localPublishState,
    setLocalPublishState,
    onUpdatePublish,
    onPublish,
  };
}

const Publishing: FC<SidebarComponentProps> = ({ notebookId, docsync }) => {
  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

  const actions = useNotebookMetaActions();
  const localPublish = usePublishLocalActions(notebookId, {
    onUpdatePublishState: actions.onUpdatePublishState,
    onPublishNotebook: actions.onPublishNotebook,
  });
  const _publishedVersionState = usePublishedVersionState({
    notebookId,
    docsync,
  });

  const publishedVersionState: PublishedVersionState =
    localPublish.localPublishState != null
      ? 'first-time-publish'
      : _publishedVersionState;

  const accessActions = useNotebookAccessActions();
  const [selectedTab, onChangeSelectedTab] = useNotebookMetaData((s) => [
    s.publishingTab,
    s.setPublishingTab,
  ]);

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

  const allowInviting = isFlagEnabled('NEW_PAYMENTS')
    ? data?.workspace?.plan === 'team' || data?.workspace?.plan === 'enterprise'
    : data?.workspace?.isPremium || canInvite;

  const publishingState =
    localPublish.localPublishState ?? getPublishingState(data);

  return (
    <NotebookPublishingPopUp
      isPremium={isPremiumWorkspace}
      notebookName={notebookName}
      workspaceId={data?.workspace?.id ?? ''}
      hasPaywall={!allowInviting}
      invitedUsers={data?.access.users}
      nrOfTeamMembers={data?.workspace?.membersCount}
      manageTeamURL={manageTeamURL}
      teamName={data?.workspace?.name ?? ''}
      isAdmin={data?.myPermissionType === 'ADMIN'}
      snapshots={data?.snapshots ?? []}
      notebookId={notebookId}
      publishingState={publishingState}
      publishedVersionState={publishedVersionState}
      onUpdatePublish={localPublish.onUpdatePublish}
      onPublish={localPublish.onPublish}
      onInvite={accessActions.onInviteByEmail}
      onChange={accessActions.onChangeAccess}
      onRemove={accessActions.onRemoveAccess}
      selectedTab={selectedTab}
      allowDuplicate={data?.canPublicDuplicate ?? true}
      onChangeSelectedTab={onChangeSelectedTab}
      onUpdateAllowDuplicate={actions.onUpdateAllowDuplicate}
    />
  );
};

export default Publishing;
