import { DocSyncEditor } from '@decipad/docsync';
import { FC, useContext, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotebookAccessActions, useNotebookMetaActions } from '../../hooks';
import {
  useClaimNotebookMutation,
  useGetNotebookMetaQuery,
} from '@decipad/graphql-client';
import { notebooks, useRouteParams, workspaces } from '@decipad/routing';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { useBackActions, useEditorUndoState } from './hooks';
import { debounce, interval } from 'rxjs';
import {
  AIModeSwitch,
  NotebookOptions,
  NotebookPath,
  NotebookPublishingPopUp,
  NotebookStatusDropdown,
  NotebookTopbar,
  TColorStatus,
  TopbarPlaceholder,
  UndoButtons,
  p13Medium,
} from '@decipad/ui';
import { noop } from '@decipad/utils';
import styled from '@emotion/styled';
import { Caret } from 'libs/ui/src/icons';
import { useStripeCollaborationRules } from '@decipad/react-utils';
import { useSession } from 'next-auth/react';
import { ClientEventsContext } from '@decipad/client-events';

const DEBOUNCE_HAS_UNPUBLISHED_CHANGES_TIME_MS = 1_000;
const SNAPSHOT_NAME = 'Published 1';

export interface TopbarProps {
  readonly notebookId: string;
  readonly docsync: DocSyncEditor | undefined;
}

export const MenuItemButton = styled.div(p13Medium, {
  cursor: 'pointer',
  userSelect: 'none',
  'div em': {
    cursor: 'pointer',
    userSelect: 'none',
  },
});

/**
 * Entire Topbar Wrapper.
 *
 * Responsible for loading topbar dependencies, and all its elements.
 */
const Topbar: FC<TopbarProps> = ({ notebookId, docsync }) => {
  const [searchParams] = useSearchParams();

  const actions = useNotebookMetaActions();
  const accessActions = useNotebookAccessActions();

  const [isNotebookCreated, setIsNotebookCreated] = useState(
    searchParams.get('openAiPanel') === 'true'
  );
  const isNotebookCreatedRef = useRef(false);

  const sidebarData = useNotebookMetaData((state) => ({
    sidebarOpen: state.sidebarOpen,
    toggleSidebar: state.toggleSidebar,
    hasPublished: state.hasPublished,
  }));

  const aiModeData = useNotebookMetaData((state) => ({
    aiMode: state.aiMode,
    toggleAiMode: state.toggleAIMode,
  }));

  useEffect(() => {
    if (isNotebookCreated && !isNotebookCreatedRef.current) {
      setIsNotebookCreated(false);
      if (!aiModeData.aiMode) {
        aiModeData.toggleAiMode();
      }
      isNotebookCreatedRef.current = true;
    }
  }, [isNotebookCreated, aiModeData]);

  const [canUndo, canRedo] = useEditorUndoState(docsync);

  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

  const isGPTGenerated = meta.data?.getPadById?.gist === 'AI';

  const permission = meta.data?.getPadById?.myPermissionType;

  const { embed: _embed } = useRouteParams(notebooks({}).notebook);
  const isEmbed = Boolean(_embed);

  const [, claimNotebook] = useClaimNotebookMutation();

  /**
   * Edge case. We default to a closed sidebar,
   * so that in read mode we don't get any jumps on the sidebar.
   *
   * This is only a problem IF its the users first time writing on the platform
   * Where we must toggle their sidebar open by default
   */
  useEffect(() => {
    switch (permission) {
      case 'ADMIN':
      case 'WRITE': {
        const { name } = useNotebookMetaData.persist.getOptions();
        if (!name) return;
        const hasStorage = localStorage.getItem(name) != null;
        if (!hasStorage) {
          sidebarData.toggleSidebar();
        }
        break;
      }
      default: {
        if (sidebarData.sidebarOpen) {
          sidebarData.toggleSidebar();
        }
      }
    }

    if (!useNotebookMetaData.persist.hasHydrated()) {
      useNotebookMetaData.persist.rehydrate();
    }
  }, [permission, sidebarData]);

  const [snapshotVersion, setSnapshotVersion] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    setSnapshotVersion((version) => {
      if (version) return;
      return (
        meta.data?.getPadById?.snapshots.find(
          (s) => s.snapshotName === SNAPSHOT_NAME
        )?.version ?? undefined
      );
    });
  }, [meta.data?.getPadById?.snapshots]);

  useEffect(() => {
    const sub = sidebarData.hasPublished.subscribe(() => {
      setHasUnpublishedChanges(false);
      setSnapshotVersion(docsync?.getVersionChecksum());
    });
    return () => {
      sub.unsubscribe();
    };
  }, [docsync, sidebarData.hasPublished]);

  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

  const clientEvent = useContext(ClientEventsContext);

  useEffect(() => {
    if (!meta.data?.getPadById?.isPublic || !docsync || !snapshotVersion)
      return;
    if (!docsync.isLoadedLocally || !docsync.isLoadedRemotely) return;

    setHasUnpublishedChanges(!docsync.equals(snapshotVersion));
  }, [docsync, snapshotVersion, meta.data?.getPadById?.isPublic]);

  useEffect(() => {
    const debouncedSub = docsync?.events.pipe(
      debounce(() => interval(DEBOUNCE_HAS_UNPUBLISHED_CHANGES_TIME_MS))
    );

    const sub = debouncedSub?.subscribe(() => {
      if (
        meta.data?.getPadById?.isPublic &&
        !(snapshotVersion && docsync?.equals(snapshotVersion))
      ) {
        setHasUnpublishedChanges(true);
      }
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [
    docsync,
    docsync?.events,
    snapshotVersion,
    meta.data?.getPadById?.isPublic,
  ]);

  const data = meta.data?.getPadById;
  const userWorkspaces = meta.data?.workspaces ?? [];

  const { status: sessionStatus } = useSession();

  const { canInvite } = useStripeCollaborationRules(
    data?.access.users,
    data?.workspace?.access?.users ?? []
  );

  const manageTeamURL = data?.workspace
    ? workspaces({})
        .workspace({
          workspaceId: data.workspace.id,
        })
        .members({}).$
    : workspaces({}).$;

  const onBack = useBackActions({
    workspace: data?.workspace,
    userWorkspaces: meta.data?.workspaces ?? [],
    isSharedNotebook: data?.myPermissionType == null,
  });

  if (!meta.data?.getPadById) {
    return <TopbarPlaceholder />;
  }

  const notebookName = data?.name ?? 'My Notebook';

  const isPremiumWorkspace = Boolean(data?.workspace?.isPremium);
  const hasPaywall = !canInvite && !isPremiumWorkspace;

  return (
    <NotebookTopbar
      NotebookOptions={
        <NotebookOptions
          notebookId={notebookId}
          canDelete={false}
          permissionType={data?.myPermissionType}
          isArchived={Boolean(data?.archived)}
          workspaces={userWorkspaces}
          trigger={
            <MenuItemButton data-testId="notebook-actions">
              <NotebookPath concatName notebookName={notebookName} />
              <Caret variant="down" />
            </MenuItemButton>
          }
          notebookStatus={
            <NotebookStatusDropdown
              status={(data?.status ?? 'Draft') as TColorStatus}
              onChangeStatus={(s) => actions.onChangeStatus(notebookId, s)}
            />
          }
          actions={actions}
          creationDate={new Date(data?.createdAt)}
          workspaceId={data?.workspace?.id ?? ''}
          onDuplicate={(workspaceId) =>
            actions.onDuplicateNotebook(notebookId, true, workspaceId)
          }
        />
      }
      UndoButtons={
        <UndoButtons
          canUndo={canUndo}
          canRedo={canRedo}
          isEmbed={isEmbed}
          onRedo={() => docsync?.undoManager?.redo() || noop}
          onUndo={() => docsync?.undoManager?.undo() || noop}
          onRevertChanges={() => docsync?.clearAll()}
        />
      }
      AiModeSwitch={
        <AIModeSwitch
          value={aiModeData.aiMode}
          onChange={aiModeData.toggleAiMode}
        />
      }
      NotebookPublishing={
        <NotebookPublishingPopUp
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
          isPublished={Boolean(data?.isPublic)}
          hasUnpublishedChanges={hasUnpublishedChanges}
          onUpdatePublish={actions.onUpdatePublishState}
          onInvite={accessActions.onInviteByEmail}
          onChange={accessActions.onChangeAccess}
          onRemove={accessActions.onRemoveAccess}
        />
      }
      access={{
        isAuthenticated: sessionStatus === 'authenticated',
        isSharedNotebook: data?.myPermissionType == null,
        hasWorkspaceAccess: data?.workspace?.myPermissionType != null,
        permissionType: data?.myPermissionType ?? undefined,
        isGPTGenerated,
      }}
      actions={{
        onBack,
        onGalleryClick: () => {
          clientEvent({
            type: 'action',
            action: 'notebook templates clicked',
          });
        },
        onToggleSidebar: sidebarData.toggleSidebar,
        onTryDecipadClick: () => {
          clientEvent({
            type: 'action',
            action: 'try decipad',
          });
        },
        onClaimNotebook: () => {
          claimNotebook({ notebookId });
        },
        onDuplicateNotebook: () =>
          actions.onDuplicateNotebook(notebookId, true),

        isSidebarOpen: sidebarData.sidebarOpen,
      }}
      authors={{
        adminName: data?.access.users.find((u) => u.permission === 'ADMIN')
          ?.user?.name,
        invitedUsers: data?.access.users ?? [],
        isWriter:
          data?.myPermissionType === 'WRITE' ||
          data?.myPermissionType === 'ADMIN',
      }}
      isEmbed={isEmbed}
      status={
        data?.archived
          ? 'Archived'
          : (data?.status as TColorStatus) ?? ('Draft' as TColorStatus)
      }
    />
  );
};

export default Topbar;
