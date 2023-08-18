/* eslint decipad/css-prop-named-variable: 0 */
import { ClientEventsContext } from '@decipad/client-events';
import { useStripeCollaborationRules } from '@decipad/react-utils';
import { workspaces } from '@decipad/routing';
import { isServerSideRendering } from '@decipad/support';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import uniqBy from 'lodash.uniqby';
import { useSession } from 'next-auth/react';
import {
  ComponentProps,
  FC,
  MouseEventHandler,
  useCallback,
  useContext,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { BehaviorSubject } from 'rxjs';
import { Button, IconButton, Link, SegmentButtons, Tooltip } from '../../atoms';
import {
  Cards,
  Caret,
  CurvedArrow,
  Deci,
  LeftArrowShort,
  Show,
  SidebarOpen,
} from '../../icons';
import {
  NotebookAvatar,
  NotebookAvatars,
  NotebookPath,
  NotebookStatusDropdown,
} from '../../molecules';
import { NotebookOptions, NotebookPublishingPopUp } from '../../organisms';
import {
  componentCssVars,
  cssVar,
  p13Bold,
  p13Medium,
  smallScreenQuery,
  tinyPhone,
} from '../../primitives';
import { closeButtonStyles } from '../../styles/buttons';
import { PermissionType } from '../../types';
import { Anchor } from '../../utils';
import * as Styled from './styles';

const topBarWrapperStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  rowGap: '8px',

  padding: '16px 0',
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

export type NotebookTopbarProps = Pick<
  ComponentProps<typeof NotebookAvatars>,
  'usersWithAccess' | 'usersFromTeam'
> &
  Pick<ComponentProps<typeof NotebookStatusDropdown>, 'status'> &
  ComponentProps<typeof NotebookPublishingPopUp> &
  Omit<ComponentProps<typeof NotebookOptions>, 'trigger' | 'pageType'> & {
    readonly permission?: PermissionType | null;
    readonly workspace?: {
      id: string;
      name: string;
      isPremium?: boolean | null;
    } | null;
    readonly workspaceAccess?: PermissionType | null;
    readonly isSharedNotebook?: boolean;
    readonly onRevertChanges?: () => void;
    readonly onRemove?: (userId: string) => Promise<void>;
    readonly onDuplicate: (
      notebookId: string,
      navToNotebook?: true
    ) => Promise<boolean>;
    readonly onInvite?: (
      email: string,
      permission: PermissionType
    ) => Promise<void>;
    readonly onChange?: (
      userId: string,
      permission: PermissionType
    ) => Promise<void>;
    readonly onChangeStatus: (
      notebookId: string,
      status: ComponentProps<typeof NotebookStatusDropdown>['status']
    ) => void;
    readonly hasLocalChanges?: BehaviorSubject<boolean>;
    readonly toggleSidebar?: MouseEventHandler<HTMLSpanElement>;
    readonly sidebarOpen: boolean;
    readonly isReadOnly: boolean;
    readonly isArchived: boolean;
    readonly isNewNotebook: boolean;

    // Undo buttons
    readonly canUndo: boolean;
    readonly canRedo: boolean;
    readonly onUndo: () => void;
    readonly onRedo: () => void;

    readonly onClearAll: () => void;
  };

// eslint-disable-next-line complexity
export const NotebookTopbar = ({
  workspace,
  notebook,
  usersWithAccess,
  usersFromTeam,
  permission,
  isSharedNotebook,
  workspaceAccess,
  toggleSidebar,
  sidebarOpen,
  isReadOnly,
  isNewNotebook,
  workspaces: userWorkspaces,

  canUndo,
  canRedo,
  onUndo,
  onRedo,

  notebookId,
  creationDate,
  isArchived,
  onDelete,
  onUnarchive,
  onExportBackups,
  onExport,
  onDuplicate,
  onClearAll,
  onMoveWorkspace,

  // Status dropdown
  status,
  onChangeStatus,

  ...sharingProps
}: NotebookTopbarProps): ReturnType<FC> => {
  const { status: sessionStatus } = useSession();
  const isAdmin = permission === 'ADMIN';
  const isWriter =
    permission === 'ADMIN' || permission === 'WRITE' || workspaceAccess;

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

  const invitedUsers: NotebookAvatar[] = uniqBy(
    [...(usersWithAccess || [])],
    (access) => access.user?.id
  );

  const manageTeamURL = workspace
    ? workspaces({})
        .workspace({
          workspaceId: workspace.id,
        })
        .members({}).$
    : workspaces({}).$;

  const teamUsers: NotebookAvatar[] = uniqBy(
    [
      ...(usersFromTeam || []).map((user) => ({
        ...user,
        isTeamMember: true,
      })),
    ],
    (access) => access.user?.id
  );

  const oneAdminUser = invitedUsers.find((u) => u.permission === 'ADMIN');

  const isPremiumWorkspace = Boolean(workspace?.isPremium);
  const teamName = workspace?.name;
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

  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showClearAll, setShowClearAll] = useState(isNewNotebook);

  const changeStatus = useCallback(
    (s: NotebookTopbarProps['status']) => {
      onChangeStatus(notebookId, s);
    },
    [notebookId, onChangeStatus]
  );

  const duplicateNotebook = useCallback(() => {
    setIsDuplicating(true);
    onDuplicate(notebookId, true).finally(() => setIsDuplicating(false));
  }, [notebookId, onDuplicate]);

  return (
    <div css={topBarWrapperStyles}>
      {/* Left side */}
      {!isReadOnly ? (
        <Styled.LeftContainer>
          {workspaceAccess || isSharedNotebook ? (
            <Styled.IconWrap>
              <IconButton onClick={onBack}>
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
                  <NotebookPath notebookName={notebook.name} />
                  <Caret variant="down" />
                </div>
              }
              notebookStatus={
                <NotebookStatusDropdown
                  status={status}
                  onChangeStatus={changeStatus}
                />
              }
              onDelete={onDelete}
              onUnarchive={onUnarchive}
              onExportBackups={onExportBackups}
              onExport={onExport}
              onDuplicate={onDuplicate}
              onMoveWorkspace={onMoveWorkspace}
              creationDate={creationDate}
            />
            <Styled.Status data-testId="notebook-status">
              {status}
            </Styled.Status>
          </Styled.TitleContainer>
          <Styled.ActionButtons>
            <button type="button" onClick={onUndo} disabled={!canUndo}>
              <CurvedArrow direction="left" active={canUndo} />
            </button>
            <button type="button" onClick={onRedo} disabled={!canRedo}>
              <CurvedArrow direction="right" active={canRedo} />
            </button>
          </Styled.ActionButtons>
          {showClearAll && !canUndo && (
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

      {/* Right side */}
      <div css={rightSideStyles}>
        {isWriter && (
          <div
            css={{
              display: 'flex',
              gap: '5px',
            }}
          >
            <div css={[linksStyles, hideForSmallScreenStyles]}>
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

            <div
              css={{
                [smallScreenQuery]: {
                  visibility: 'hidden',
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
          </div>
        )}
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
          allowInvitation={isAdmin}
          isWriter={!!isWriter}
          invitedUsers={invitedUsers}
          teamUsers={teamUsers}
          teamName={teamName}
          notebook={notebook}
          {...sharingProps}
        />

        {sessionStatus === 'authenticated' ? (
          (isAdmin || isWriter) && !isServerSideRendering() ? (
            <NotebookPublishingPopUp
              notebook={notebook}
              hasPaywall={hasPaywall}
              invitedUsers={invitedUsers}
              teamUsers={teamUsers}
              manageTeamURL={manageTeamURL}
              teamName={teamName}
              isAdmin={isAdmin}
              {...sharingProps}
            />
          ) : (
            <Button
              disabled={isDuplicating}
              type="primaryBrand"
              onClick={duplicateNotebook}
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
    </div>
  );
};
