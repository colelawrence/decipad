/* eslint-disable prefer-destructuring */
/* eslint decipad/css-prop-named-variable: 0 */
import { ClientEventsContext } from '@decipad/client-events';
import {
  useCanUseDom,
  useStripeCollaborationRules,
} from '@decipad/react-utils';
import { workspaces, docs } from '@decipad/routing';
import { isServerSideRendering } from '@decipad/support';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { useSession } from 'next-auth/react';
import { FC, useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, Link, SegmentButtons, Tooltip } from '../../atoms';
import {
  Cards,
  Caret,
  CircularArrow,
  CurvedArrow,
  Deci,
  LeftArrowShort,
  Show,
  SidebarOpen,
} from '../../icons';
import {
  AIModeSwitch,
  NotebookAvatars,
  NotebookPath,
  NotebookStatusDropdown,
} from '../../molecules';
import {
  HelpMenu,
  NotebookOptions,
  NotebookPublishingPopUp,
} from '../../organisms';
import {
  componentCssVars,
  cssVar,
  p12Bold,
  p13Bold,
  p13Medium,
  smallScreenQuery,
  tinyPhone,
} from '../../primitives';
import { closeButtonStyles } from '../../styles/buttons';
import { PermissionType } from '../../types';
import { Anchor, TColorStatus } from '../../utils';
import * as Styled from './styles';
import {
  NotebookMetaDataFragment,
  NotebookWorkspacesDataFragment,
} from '@decipad/graphql-client';
import {
  NotebookAccessActionsReturn,
  NotebookMetaActionsReturn,
} from '@decipad/interfaces';
import { isFlagEnabled } from '@decipad/feature-flags';

const topBarWrapperStyles = (isEmbed: boolean) =>
  css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    rowGap: '8px',
    width: '100%',
    height: '100%',

    padding: isEmbed ? '0' : '16px 0',
  });

const rightSideStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1em',
});

const hideForSmallScreenStyles = css({
  [smallScreenQuery]: {
    display: 'none',
  },
});

const linksStyles = css({
  backgroundColor: componentCssVars('ButtonTertiaryAltDefaultBackground'),
  color: componentCssVars('ButtonTertiaryAltDefaultText'),
  display: 'flex',
  gap: '12px',
  height: '32px',
  ':hover': {
    backgroundColor: componentCssVars('ButtonTertiaryAltHoverBackground'),
    color: componentCssVars('ButtonTertiaryAltHoverText'),
  },
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
  padding: '8px',
});
const topbarButtonStyles = css(p13Bold);

const iconStyles = css({
  display: 'grid',
  height: '16px',
  width: '16px',
});

const VerticalDivider = () => (
  <div
    css={[
      {
        width: '1px',
        height: '100%',
        backgroundColor: cssVar('borderSubdued'),
      },
      hideForSmallScreenStyles,
    ]}
  />
);

export type NotebookTopbarProps = {
  readonly isSharedNotebook?: boolean;
  readonly onRevertChanges?: () => void;
  readonly onRemove?: (userId: string) => Promise<void>;
  readonly onInvite?: (
    email: string,
    permission: PermissionType
  ) => Promise<void>;
  readonly onChange?: (
    userId: string,
    permission: PermissionType
  ) => Promise<void>;
  readonly isNewNotebook: boolean;

  // Sidebar
  readonly sidebarOpen: boolean;
  readonly toggleSidebar: () => void;

  // AI Assistant
  readonly aiMode: boolean;
  readonly toggleAIMode: () => void;

  // Undo buttons
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onUndo: () => void;
  readonly onRedo: () => void;

  readonly onClearAll: () => void;

  readonly isEmbed: boolean;

  // Important that this can be undefined
  // Because when you re-fetch the query, its going to be
  readonly notebookMeta: NotebookMetaDataFragment | null | undefined;

  readonly notebookMetaActions: NotebookMetaActionsReturn;
  readonly notebookAccessActions: NotebookAccessActionsReturn;

  readonly userWorkspaces: Array<NotebookWorkspacesDataFragment>;

  readonly hasUnpublishedChanges: boolean;
};

// eslint-disable-next-line complexity
export const NotebookTopbar = ({
  isSharedNotebook,
  toggleSidebar,
  sidebarOpen,
  toggleAIMode,
  aiMode,
  isNewNotebook,
  hasUnpublishedChanges,

  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRevertChanges,

  onClearAll,

  // Status dropdown
  isEmbed,

  notebookMeta,
  notebookMetaActions,
  notebookAccessActions,
  userWorkspaces,
}: NotebookTopbarProps): ReturnType<FC> => {
  // --------------------------------------------------

  const notebookId = notebookMeta?.id ?? '';
  const workspace = notebookMeta?.workspace;
  const usersWithAccess = notebookMeta?.access.users ?? [];
  const usersFromTeam = workspace?.access?.users ?? [];
  const permission = notebookMeta?.myPermissionType ?? 'READ';
  const status = (notebookMeta?.status ?? 'Draft') as TColorStatus;
  const isArchived = Boolean(notebookMeta?.archived);
  const isReadOnly = notebookMeta?.myPermissionType === 'READ';
  const notebookName = notebookMeta?.name ?? 'My Notebook';
  const snapshots = notebookMeta?.snapshots ?? [];
  const workspaceAccess = notebookMeta?.workspace?.myPermissionType;
  const creationDate = notebookMeta?.createdAt
    ? new Date(notebookMeta.createdAt)
    : new Date();
  const isPublished = Boolean(notebookMeta?.isPublic);

  // --------------------------------------------------

  const { status: sessionStatus } = useSession();
  const canUseDom = useCanUseDom();

  const isAdmin = permission === 'ADMIN';
  const isWriter = permission === 'ADMIN' || permission === 'WRITE';

  const clientEvent = useContext(ClientEventsContext);
  const onGalleryClick = useCallback(
    () =>
      clientEvent({
        type: 'action',
        action: 'notebook templates clicked',
      }),
    [clientEvent]
  );
  const onTryDecipadClick = useCallback(() => {
    clientEvent({
      type: 'action',
      action: 'try decipad',
    });
  }, [clientEvent]);

  const navigate = useNavigate();

  const onBack = useCallback(() => {
    const redirectToWorkspace =
      workspace && workspaceAccess
        ? workspaces({}).workspace({
            workspaceId: workspace.id,
          }).$
        : null;

    const hasWorkspaces = userWorkspaces && userWorkspaces.length > 0;
    const redirectToShared =
      isSharedNotebook && hasWorkspaces
        ? workspaces({})
            .workspace({
              workspaceId: userWorkspaces[0].id,
            })
            .shared({}).$
        : null;

    if (redirectToWorkspace) {
      navigate(redirectToWorkspace);
    } else if (redirectToShared) {
      navigate(redirectToShared);
    } else {
      navigate('/w');
    }
  }, [navigate, workspace, userWorkspaces, workspaceAccess, isSharedNotebook]);

  const { canInvite } = useStripeCollaborationRules(
    usersWithAccess,
    usersFromTeam
  );

  const manageTeamURL = workspace
    ? workspaces({})
        .workspace({
          workspaceId: workspace.id,
        })
        .members({}).$
    : workspaces({}).$;

  const oneAdminUser = usersWithAccess.find((u) => u.permission === 'ADMIN');

  const isPremiumWorkspace = Boolean(workspace?.isPremium);
  const teamName = workspace?.name ?? '';
  const hasPaywall = !canInvite && !isPremiumWorkspace;

  const readModeTopbar = (
    <Styled.LeftContainer>
      <Styled.IconWrap>
        <Link href="https://decipad.com">
          <Deci />
        </Link>
      </Styled.IconWrap>

      <NotebookPath
        notebookName={'Decipad — smart document'}
        href="https://decipad.com"
      />
    </Styled.LeftContainer>
  );

  const undoButtons = (
    <Styled.ActionButtons>
      <div>
        <button type="button" onClick={onUndo} disabled={!canUndo}>
          <CurvedArrow direction="left" active={canUndo} />
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo}>
          <CurvedArrow direction="right" active={canRedo} />
        </button>
      </div>
      {isEmbed && (
        <button type="button" onClick={onRevertChanges}>
          <CircularArrow />
          <span css={p12Bold}>Clear Changes</span>
        </button>
      )}
    </Styled.ActionButtons>
  );

  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showClearAll, setShowClearAll] = useState(
    isFlagEnabled('POPULATED_NEW_NOTEBOOK')
  );

  const changeStatus = useCallback(
    (s: TColorStatus) => {
      notebookMetaActions.onChangeStatus(notebookId, s);
    },
    [notebookId, notebookMetaActions]
  );

  const duplicateNotebook = useCallback(() => {
    const workspaceId = isReadOnly ? '' : workspace?.id;
    setIsDuplicating(true);
    notebookMetaActions
      .onDuplicateNotebook(notebookId, true, workspaceId)
      .finally(() => setIsDuplicating(false));
  }, [isReadOnly, notebookId, notebookMetaActions, workspace?.id]);

  return (
    <div css={topBarWrapperStyles(isEmbed)}>
      <div
        css={{
          width: '100%',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left side */}
        {!isReadOnly ? (
          <Styled.LeftContainer>
            {workspaceAccess || isSharedNotebook ? (
              <Styled.IconWrap>
                <IconButton onClick={onBack} testId="go-to-workspace">
                  <LeftArrowShort />
                </IconButton>
              </Styled.IconWrap>
            ) : (
              <Styled.IconWrap>
                <Link href="https://decipad.com">
                  <Deci />
                </Link>
              </Styled.IconWrap>
            )}
            <Styled.TitleContainer>
              <NotebookOptions
                notebookId={notebookId}
                isArchived={isArchived}
                workspaces={userWorkspaces}
                trigger={
                  <div data-testId="notebook-actions">
                    <NotebookPath concatName notebookName={notebookName} />
                    <Caret variant="down" />
                  </div>
                }
                notebookStatus={
                  <NotebookStatusDropdown
                    status={status}
                    onChangeStatus={changeStatus}
                  />
                }
                onDelete={notebookMetaActions.onDeleteNotebook}
                onUnarchive={notebookMetaActions.onUnarchiveNotebook}
                onExportBackups={notebookMetaActions.onDownloadNotebookHistory}
                onExport={notebookMetaActions.onDownloadNotebook}
                onMoveWorkspace={notebookMetaActions.onMoveToWorkspace}
                onDuplicate={notebookMetaActions.onDuplicateNotebook}
                creationDate={creationDate}
                workspaceId={workspace?.id ?? ''}
              />
              <Styled.Status data-testId="notebook-status">
                {status}
              </Styled.Status>
            </Styled.TitleContainer>
            {!(isReadOnly || isEmbed) && undoButtons}
            {isNewNotebook && showClearAll && (
              <Button
                type="primary"
                onClick={() => {
                  setShowClearAll(false);
                  onClearAll();
                }}
              >
                Clear All
              </Button>
            )}
          </Styled.LeftContainer>
        ) : (
          readModeTopbar
        )}
        {isWriter && !isEmbed && isFlagEnabled('AI_ASSISTANT_CHAT') && (
          <AIModeSwitch value={aiMode} onChange={toggleAIMode} />
        )}
        {/* Right side */}
        {isEmbed ? (
          undoButtons
        ) : (
          <div css={rightSideStyles}>
            <div
              css={{
                display: 'flex',
                gap: '5px',
              }}
            >
              {isWriter && (
                <div css={[linksStyles, !isEmbed && hideForSmallScreenStyles]}>
                  <em css={topbarButtonStyles}>
                    <Anchor
                      href={'http://www.decipad.com/templates'}
                      // Analytics
                      onClick={onGalleryClick}
                    >
                      <span
                        css={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: '8px',
                          alignItems: 'center',
                          color: cssVar('textHeavy'),
                        }}
                      >
                        <span css={iconStyles}>
                          <Cards />
                        </span>
                        Templates
                      </span>
                    </Anchor>
                  </em>
                </div>
              )}
              {canUseDom && sessionStatus === 'authenticated' && !isEmbed && (
                <div>
                  <HelpMenu
                    discordUrl="http://discord.gg/decipad"
                    docsUrl={docs({}).$}
                    releaseUrl={docs({}).page({ name: 'releases' }).$}
                  />
                </div>
              )}
              {isWriter && (
                <div
                  css={{
                    [smallScreenQuery]: {
                      display: 'none',
                    },
                  }}
                >
                  <SegmentButtons
                    variant="darker"
                    buttons={[
                      {
                        children: (
                          <div css={{ width: '20px', height: '20px' }}>
                            <SidebarOpen />
                          </div>
                        ),
                        onClick: toggleSidebar || noop,
                        selected: sidebarOpen,
                        tooltip: 'Open the sidebar',
                        testId: 'top-bar-sidebar',
                      },
                    ]}
                  />
                </div>
              )}
            </div>
            {isWriter && <VerticalDivider />}
            {sessionStatus === 'authenticated' ? (
              isWriter && !isServerSideRendering() ? null : (
                <div
                  css={css(p13Medium, {
                    color: cssVar('textSubdued'),
                    display: 'flex',
                  })}
                >
                  <Tooltip
                    side="bottom"
                    hoverOnly
                    trigger={
                      <span
                        css={{
                          cursor: 'pointer',
                          width: 16,
                          height: 16,
                          ':hover': {
                            ...closeButtonStyles,
                          },
                        }}
                      >
                        <Show />
                      </span>
                    }
                  >
                    {`Ask ${
                      oneAdminUser && oneAdminUser.user?.name
                        ? oneAdminUser.user.name
                        : 'an admin'
                    } to change this`}
                  </Tooltip>
                  <span css={css({ [tinyPhone]: { display: 'none' } })}>
                    You are in reading mode
                  </span>
                </div>
              )
            ) : (
              <p
                css={css(p13Medium, {
                  color: cssVar('textSubdued'),
                  [tinyPhone]: {
                    display: 'none',
                  },
                })}
              >
                Authors behind this notebook
              </p>
            )}
            <NotebookAvatars
              isWriter={!!isWriter}
              invitedUsers={usersWithAccess}
            />

            {sessionStatus === 'authenticated' ? (
              (isAdmin || isWriter) && !isServerSideRendering() ? (
                <NotebookPublishingPopUp
                  notebookName={notebookName}
                  workspaceId={workspace?.id ?? ''}
                  hasPaywall={hasPaywall}
                  invitedUsers={usersWithAccess}
                  nrOfTeamMembers={notebookMeta?.workspace?.membersCount}
                  manageTeamURL={manageTeamURL}
                  teamName={teamName}
                  isAdmin={isAdmin}
                  snapshots={snapshots}
                  notebookId={notebookId}
                  isPublished={isPublished}
                  hasUnpublishedChanges={hasUnpublishedChanges}
                  onPublish={notebookMetaActions.onPublishNotebook}
                  onUnpublish={notebookMetaActions.onUnpublishNotebook}
                  onInvite={notebookAccessActions.onInviteByEmail}
                  onChange={notebookAccessActions.onChangeAccess}
                  onRemove={notebookAccessActions.onRemoveAccess}
                />
              ) : (
                <Button
                  disabled={isDuplicating}
                  type="primaryBrand"
                  onClick={duplicateNotebook}
                  testId="duplicate-button"
                >
                  {isDuplicating ? 'Duplicating...' : 'Duplicate notebook'}
                </Button>
              )
            ) : (
              <Button
                href="/"
                // Analytics
                type={'primaryBrand'}
                onClick={onTryDecipadClick}
              >
                Try Decipad
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
