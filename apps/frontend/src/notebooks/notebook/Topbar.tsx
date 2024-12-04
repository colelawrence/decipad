/* eslint-disable camelcase */
import { ClientEventsContext } from '@decipad/client-events';
import type { DocSyncEditor } from '@decipad/docsync';
import {
  useClaimNotebookMutation,
  useGetNotebookMetaQuery,
} from '@decipad/graphql-client';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { useNotebookRoute } from '@decipad/routing';
import type { TColorStatus } from '@decipad/ui';
import {
  Button,
  Dot,
  NotebookOptions,
  NotebookStatusDropdown,
  NotebookTopbar,
  TopbarPlaceholder,
  UndoButtons,
  p13Medium,
} from '@decipad/ui';
import { noop } from '@decipad/utils';
import styled from '@emotion/styled';
import { Ellipsis } from 'libs/ui/src/icons';
import { useSession } from 'next-auth/react';
import type { FC } from 'react';
import { memo, useContext, useMemo } from 'react';
import { useNotebookMetaActions } from '../../hooks';
import {
  useBackActions,
  useEditorUndoState,
  usePublishedVersionState,
} from './hooks';

export interface TopbarProps {
  readonly notebookId: string;
  readonly docsync: DocSyncEditor | undefined;
  readonly isNavBarVisible?: boolean;
  readonly toggleNavBarVisibility: () => void;
  readonly shouldRenderNavigationSidebar?: boolean;
}

export const MenuItemButton = styled.div<{ isReadOnly?: boolean }>(
  p13Medium,
  (props) => ({
    cursor: 'pointer',
    userSelect: 'none',
    ...(!props.isReadOnly && {
      'div em': {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  })
);

/**
 * Entire Topbar Wrapper.
 *
 * Responsible for loading topbar dependencies, and all its elements.
 */
const Topbar: FC<TopbarProps> = memo(
  ({
    notebookId,
    docsync,
    isNavBarVisible,
    toggleNavBarVisibility,
    shouldRenderNavigationSidebar,
  }) => {
    const actions = useNotebookMetaActions();

    const sidebarData = useNotebookMetaData((state) => ({
      isDefaultSidebarOpen: state.isDefaultSidebarOpen,
      toggleSidebar: state.toggleSidebar,
      component: state.sidebarComponent,
      setPublishingTab: state.setPublishingTab,
      isAiOpen: state.isAiOpen,
      isSidebarClosed: state.isSidebarClosed,
      isAnnotationsOpen: state.isAnnotationsOpen,
      closeSideBar: () => state.setSidebar({ type: 'closed' }),
    }));

    const [canUndo, canRedo] = useEditorUndoState(docsync);

    const [meta] = useGetNotebookMetaQuery({
      variables: { id: notebookId },
    });

    const publishedVersionState = usePublishedVersionState({
      notebookId,
      docsync,
    });
    const needsUpdate =
      publishedVersionState != null &&
      publishedVersionState !== 'up-to-date' &&
      (meta.data?.getPadById?.isPublic ||
        meta.data?.getPadById?.userConsentToFeatureOnGallery);

    const isGPTGenerated = meta.data?.getPadById?.gist === 'AI';

    const { isEmbed } = useNotebookRoute();

    const [, claimNotebook] = useClaimNotebookMutation();

    const clientEvent = useContext(ClientEventsContext);

    const data = meta.data?.getPadById;

    const userWorkspaces = meta.data?.workspaces ?? [];

    // prepping functionality to choose a workspace to duplicate to
    const workspaceForDuplicate = useMemo(
      () => meta.data?.workspaces[0]?.id,
      [meta.data?.workspaces]
    );

    const { status: sessionStatus } = useSession();

    const onBack = useBackActions({
      workspace: data?.workspace,
      userWorkspaces: meta.data?.workspaces ?? [],
      isSharedNotebook: data?.myPermissionType == null,
    });

    const isReadOnly = Boolean(docsync?.isReadOnly);
    const notebookName = data?.name ?? 'Untitled';
    const showTrigger =
      data?.myPermissionType === 'WRITE' || data?.myPermissionType === 'ADMIN';

    if (!meta.data?.getPadById) {
      return <TopbarPlaceholder />;
    }

    return (
      <NotebookTopbar
        isNavBarVisible={isNavBarVisible}
        shouldRenderNavigationSidebar={shouldRenderNavigationSidebar}
        toggleNavBarVisibility={toggleNavBarVisibility}
        workspaceName={data?.workspace?.name}
        notebookName={notebookName}
        NotebookOptions={
          <NotebookOptions
            notebookId={notebookId}
            canDelete={false}
            permissionType={data?.myPermissionType}
            isArchived={Boolean(data?.archived)}
            workspaces={userWorkspaces}
            trigger={
              <MenuItemButton
                data-testId="notebook-actions"
                isReadOnly={isReadOnly}
              >
                {showTrigger && <Ellipsis />}
              </MenuItemButton>
            }
            notebookStatus={
              <NotebookStatusDropdown
                status={(data?.status ?? 'Draft') as TColorStatus}
                onChangeStatus={(s) => actions.onChangeStatus(notebookId, s)}
                permissionType={data?.myPermissionType}
              />
            }
            actions={actions}
            creationDate={new Date(data?.createdAt)}
            workspaceId={data?.workspace?.id ?? ''}
            workspaceForDuplicate={workspaceForDuplicate}
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
        NotebookPublishing={
          <Button
            type="primaryBrand"
            onClick={() => {
              sidebarData.toggleSidebar({ type: 'publishing' });
              if (needsUpdate) {
                sidebarData.setPublishingTab('publishing');
              }
            }}
            testId="publish-button"
          >
            {needsUpdate && data?.myPermissionType === 'ADMIN' ? (
              <span
                css={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                data-testId="publish-notification"
              >
                <Dot size={8} noBorder position="relative" />
                Share
              </span>
            ) : (
              'Share'
            )}
          </Button>
        }
        access={{
          isAuthenticated: sessionStatus === 'authenticated',
          isSharedNotebook: data?.myPermissionType == null,
          hasWorkspaceAccess: data?.workspace?.myPermissionType != null,
          permissionType: data?.myPermissionType ?? undefined,
          isGPTGenerated,
          isDuplicateAllowed: data?.canPublicDuplicate ?? true,
        }}
        actions={{
          onBack,
          onGalleryClick: () => {
            clientEvent({
              segmentEvent: {
                type: 'action',
                action: 'Templates Button Clicked',
                props: {
                  analytics_source: 'frontend',
                },
              },
            });
          },
          onToggleAI: () => {
            sidebarData.toggleSidebar({ type: 'ai' });
          },
          isAiOpen: sidebarData.component.type === 'ai',
          onToggleSidebar: () =>
            sidebarData.toggleSidebar({ type: 'default-sidebar' }),
          onTryDecipadClick: () => {
            clientEvent({
              segmentEvent: {
                type: 'action',
                action: 'try decipad',
              },
            });
          },
          onClaimNotebook: () => {
            claimNotebook({ notebookId });
          },
          onDuplicateNotebook: () =>
            workspaceForDuplicate
              ? actions.onDuplicateNotebook(
                  notebookId,
                  workspaceForDuplicate,
                  true
                )
              : noop,
          onToggleAnnotations: () => {
            sidebarData.toggleSidebar({ type: 'annotations' });
          },

          isDefaultSidebarOpen:
            sidebarData.component.type === 'default-sidebar',
          closeSideBar: sidebarData.closeSideBar,
          isSidebarClosed: sidebarData.isSidebarClosed(),
          isAnnotationsOpen: sidebarData.isAnnotationsOpen(),
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
      />
    );
  }
);

export default Topbar;
