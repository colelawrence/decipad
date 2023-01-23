import { ClientEventsContext } from '@decipad/client-events';
import { isFlagEnabled } from '@decipad/feature-flags';
import { docs, workspaces } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { useSession } from 'next-auth/react';
import { ComponentProps, FC, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BehaviorSubject } from 'rxjs';
import { Button, IconButton, Link } from '../../atoms';
import { Deci, LeftArrow, Cards } from '../../icons';
import { BetaBadge, NotebookAvatars, NotebookPath } from '../../molecules';
import { NotebookPublishingPopUp } from '../../organisms';
import { cssVar, p13Bold, smallScreenQuery } from '../../primitives';
import { PermissionType } from '../../types';
import { Anchor } from '../../utils';

const wrapperStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  rowGap: '8px',

  padding: '16px 0',

  borderBottom: '1px solid',
  borderColor: cssVar('highlightColor'),
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
  backgroundColor: cssVar('buttonHoverBackground'),
  ':hover': {
    backgroundColor: cssVar('buttonHoverBackgroundHover'),
  },
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
  padding: '8px',
});
const helpLinkStyles = css(p13Bold);

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
  'usersWithAccess'
> &
  ComponentProps<typeof NotebookPublishingPopUp> & {
    permission?: PermissionType | null;
    workspace?: { id: string; name: string } | null;
    onDuplicateNotebook?: () => void;
    onRevertChanges?: () => void;
    onInvite?: (email: string) => Promise<void>;
    hasLocalChanges?: BehaviorSubject<boolean>;
  };

export const NotebookTopbar = ({
  workspace,
  notebook,
  onDuplicateNotebook = noop,
  onRevertChanges = noop,
  usersWithAccess,
  permission,
  hasLocalChanges: hasLocalChanges$,
  ...sharingProps
}: NotebookTopbarProps): ReturnType<FC> => {
  const { status: sessionStatus } = useSession();
  const isWriter = permission === 'ADMIN' || permission === 'WRITE';
  const allowInvitation =
    permission === 'ADMIN' && isFlagEnabled('SHARE_PAD_WITH_EMAIL');

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
    if (workspace) {
      navigate(workspaces({}).workspace({ workspaceId: workspace.id }).$);
    } else {
      navigate('/');
    }
  }, [navigate, workspace]);

  return (
    <div css={wrapperStyles}>
      {/* Left side */}
      <div css={leftSideStyles}>
        {isWriter && workspace ? (
          <div css={{ width: '32px', display: 'grid' }}>
            <IconButton onClick={onBack}>
              <LeftArrow />
            </IconButton>
          </div>
        ) : (
          <span css={{ display: 'grid', height: '16px', width: '16px' }}>
            <Link href="https://decipad.com">
              <Deci />
            </Link>
          </span>
        )}
        <NotebookPath
          notebookName={
            isWriter ? notebook.name : 'Decipad — interactive notebook'
          }
          workspaceName={isWriter ? workspace?.name : undefined}
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
              <em css={helpLinkStyles}>
                <Anchor
                  href={docs({}).page({ name: 'gallery' }).$}
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
          </div>
        )}
        {isWriter && <VerticalDivider />}
        <NotebookAvatars
          allowInvitation={allowInvitation}
          isWriter={isWriter}
          usersWithAccess={usersWithAccess}
          notebook={notebook}
          {...sharingProps}
        />

        {sessionStatus === 'authenticated' ? (
          isWriter ? (
            <NotebookPublishingPopUp notebook={notebook} {...sharingProps} />
          ) : (
            <Button onClick={onDuplicateNotebook}>Duplicate notebook</Button>
          )
        ) : (
          <Button
            href="/"
            // Analytics
            onClick={onTryDecipadClick}
          >
            Try Decipad
          </Button>
        )}
      </div>
    </div>
  );
};
