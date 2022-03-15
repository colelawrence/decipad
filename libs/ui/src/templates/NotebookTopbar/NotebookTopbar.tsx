import { docs } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { useSession } from 'next-auth/client';
import { ComponentProps, FC } from 'react';
import { Button, IconButton } from '../../atoms';
import { LeftArrow } from '../../icons';
import { NotebookAvatars, NotebookPath } from '../../molecules';
import { NotebookSharingPopUp } from '../../organisms';
import { cssVar, p14Medium } from '../../primitives';
import { PermissionType } from '../../types';
import { Anchor } from '../../utils';

const topbarWrapperStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  rowGap: '8px',

  padding: '16px 0',

  borderBottom: '1px solid',
  borderColor: cssVar('highlightColor'),
});

const topbarLeftSideStyles = css({
  flexGrow: 999,

  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

const topbarRightSideStyles = css({
  flexGrow: 1,

  display: 'grid',
  gridTemplateColumns: '1fr max-content max-content',
  alignItems: 'center',
  gap: '1rem',
});

const helpButtonStyles = css(p14Medium, {
  paddingRight: '16px',
});

export type NotebookTopbarProps = Pick<
  ComponentProps<typeof NotebookPath>,
  'workspaceName' | 'notebookName'
> &
  Pick<ComponentProps<typeof NotebookAvatars>, 'usersWithAccess'> & {
    workspaceHref: string;
    permission: PermissionType;
    link: string;
    onToggleShare?: () => void;
    onDuplicateNotebook?: () => void;
    sharingActive?: boolean;
  };

export const NotebookTopbar = ({
  workspaceName,
  notebookName,
  onToggleShare = noop,
  onDuplicateNotebook = noop,
  usersWithAccess,
  permission,
  sharingActive = false,
  link,
  workspaceHref,
}: NotebookTopbarProps): ReturnType<FC> => {
  const [session] = useSession();
  const isAdmin = permission === 'ADMIN';
  return (
    <div css={topbarWrapperStyles}>
      {/* Left side */}
      <div css={topbarLeftSideStyles}>
        {isAdmin && (
          <div css={{ width: '32px', display: 'grid' }}>
            <IconButton href={workspaceHref}>
              <LeftArrow />
            </IconButton>
          </div>
        )}
        <NotebookPath
          isAdmin={isAdmin}
          workspaceName={workspaceName}
          notebookName={notebookName}
          workspaceHref={workspaceHref}
        />
      </div>

      {/* Right side */}
      <div css={topbarRightSideStyles}>
        {isAdmin && (
          <em css={helpButtonStyles}>
            <Anchor href={docs({}).$}>Need help?</Anchor>
          </em>
        )}
        <NotebookAvatars usersWithAccess={usersWithAccess} />

        {session?.user ? (
          isAdmin ? (
            <NotebookSharingPopUp
              sharingActive={sharingActive}
              onToggleShare={onToggleShare}
              link={link}
            />
          ) : (
            <Button onClick={() => onDuplicateNotebook()}>
              Duplicate notebook
            </Button>
          )
        ) : (
          <Button href="https://rcagp49qi5w.typeform.com/to/i8uXYEtd">
            Try Decipad
          </Button>
        )}
      </div>
    </div>
  );
};
