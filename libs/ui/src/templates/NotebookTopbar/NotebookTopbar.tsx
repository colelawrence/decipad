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
} from 'react';
import { useNavigate } from 'react-router-dom';
import { BehaviorSubject } from 'rxjs';
import { Button, IconButton, Link, SegmentButtons, Tooltip } from '../../atoms';
import { Cards, Deci, LeftArrowShort, Show, SidebarOpen } from '../../icons';
import {
  BetaBadge,
  NotebookAvatar,
  NotebookAvatars,
  NotebookPath,
} from '../../molecules';
import { NotebookPublishingPopUp } from '../../organisms';
import {
  cssVar,
  p13Bold,
  p13Medium,
  smallScreenQuery,
  tinyPhone,
} from '../../primitives';
import { closeButtonStyles } from '../../styles/buttons';
import { PermissionType } from '../../types';
import { Anchor } from '../../utils';

const topBarWrapperStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  rowGap: '8px',

  padding: '16px 0',
});

const leftSideStyles = css({
  flex: 1,

  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',

  display: 'flex',
  alignItems: 'center',
  gap: '6px',

  maxWidth: '450px',
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
  display: 'flex',
  gap: '12px',
  height: '32px',
  backgroundColor: cssVar('strongerHighlightColor'),
  ':hover': {
    filter: 'brightness(95%)',
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
        backgroundColor: cssVar('strongerHighlightColor'),
      },
      hideForSmallScreenStyles,
    ]}
  />
);

export type NotebookTopbarProps = Pick<
  ComponentProps<typeof NotebookAvatars>,
  'usersWithAccess' | 'usersFromTeam'
> &
  ComponentProps<typeof NotebookPublishingPopUp> & {
    permission?: PermissionType | null;
    userWorkspaces?: Array<{ id: string; name: string }>;
    workspace?: { id: string; name: string; isPremium?: boolean | null } | null;
    workspaceAccess?: PermissionType | null;
    isSharedNotebook?: boolean;
    onDuplicateNotebook?: () => void;
    onRevertChanges?: () => void;
    onRemove?: (userId: string) => Promise<void>;
    onInvite?: (email: string, permission: PermissionType) => Promise<void>;
    onChange?: (userId: string, permission: PermissionType) => Promise<void>;
    hasLocalChanges?: BehaviorSubject<boolean>;
    toggleSidebar?: MouseEventHandler<HTMLSpanElement>;
    sidebarOpen: boolean;
  };

export const NotebookTopbar = ({
  userWorkspaces,
  workspace,
  notebook,
  onDuplicateNotebook = noop,
  onRevertChanges = noop,
  usersWithAccess,
  usersFromTeam,
  permission,
  isSharedNotebook,
  workspaceAccess,
  hasLocalChanges: hasLocalChanges$,
  toggleSidebar,
  sidebarOpen,

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

  const workspaceName = isSharedNotebook
    ? 'Shared with me'
    : isWriter && workspace
    ? workspace?.name
    : undefined;

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

  const allUsers: NotebookAvatar[] = uniqBy(
    [
      ...(usersFromTeam || []).map((user) => ({
        ...user,
        isTeamMember: true,
      })),
      ...(usersWithAccess || []),
    ],
    (access) => access.user.id
  );

  const oneAdminUser = allUsers.filter((u) => u.permission === 'ADMIN')[0];

  const isPremiumWorkspace = Boolean(workspace?.isPremium);
  const hasPaywall = !canInvite && !isPremiumWorkspace;

  return (
    <div css={topBarWrapperStyles}>
      {/* Left side */}
      <div css={leftSideStyles}>
        {workspaceAccess || isSharedNotebook ? (
          <div css={{ width: '32px', display: 'grid' }}>
            <IconButton onClick={onBack}>
              <LeftArrowShort />
            </IconButton>
          </div>
        ) : (
          <span
            css={{
              display: 'grid',
              height: '16px',
              width: '16px',
            }}
          >
            <Link href="https://decipad.com">
              <Deci />
            </Link>
          </span>
        )}
        <NotebookPath
          notebookName={isWriter ? notebook.name : 'Decipad — smart document'}
          workspaceName={workspaceName}
          href={!isWriter ? 'https://decipad.com' : undefined}
        />
        <BetaBadge />
      </div>

      {/* Right side */}
      <div css={rightSideStyles}>
        {isWriter && (
          <div
            style={{
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
            <SegmentButtons
              variant="topbar"
              buttons={[
                {
                  children: <SidebarOpen />,
                  onClick: toggleSidebar || noop,
                  selected: sidebarOpen,
                  tooltip: 'Open the sidebar',
                  testId: 'top-bar-sidebar',
                },
              ]}
            />
          </div>
        )}
        {isWriter && <VerticalDivider />}
        {sessionStatus === 'authenticated' ? (
          isWriter && !isServerSideRendering() ? null : (
            <div
              css={css(p13Medium, {
                color: cssVar('weakTextColor'),
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
                  oneAdminUser && oneAdminUser.user.name
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
              color: cssVar('weakTextColor'),
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
          allUsers={allUsers}
          notebook={notebook}
          {...sharingProps}
        />

        {sessionStatus === 'authenticated' ? (
          (isAdmin || isWriter) && !isServerSideRendering() ? (
            <NotebookPublishingPopUp
              notebook={notebook}
              {...sharingProps}
              hasPaywall={hasPaywall}
              allUsers={allUsers}
              isAdmin={isAdmin}
              {...sharingProps}
            />
          ) : (
            <Button type="primaryBrand" onClick={onDuplicateNotebook}>
              Duplicate notebook
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
