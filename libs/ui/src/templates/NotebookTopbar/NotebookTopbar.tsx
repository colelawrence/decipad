import { docs } from '@decipad/routing';
import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { Button, IconButton } from '../../atoms';
import { LeftArrow } from '../../icons';
import { NotebookAvatars, NotebookPath } from '../../molecules';
import { NotebookSharingPopUp } from '../../organisms';
import { cssVar, p14Medium } from '../../primitives';
import { Anchor, noop } from '../../utils';

const topbarWrapperStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid',
  borderColor: cssVar('highlightColor'),
  padding: '16px 0',
});

const topbarLeftSideStyles = css({
  height: '32px',
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(32px, auto))',
  gap: '6px',
});

const topbarRightSideStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
});

const helpButtonStyles = css(p14Medium, {
  marginRight: '16px',
});

export type NotebookTopbarProps = Pick<
  ComponentProps<typeof NotebookPath>,
  'workspaceName' | 'notebookName'
> &
  Pick<ComponentProps<typeof NotebookAvatars>, 'usersWithAccess'> & {
    workspaceHref: string;
    permission?: string | null;
    link: string;
    onToggleShare?: () => void;
  };

export const NotebookTopbar = ({
  workspaceName,
  notebookName,
  onToggleShare = noop,
  usersWithAccess,
  permission,
  link,
  workspaceHref,
}: NotebookTopbarProps): ReturnType<FC> => {
  const isAdmin = permission === 'ADMIN';
  const isNotUser = permission === 'READ';
  return (
    <div css={topbarWrapperStyles}>
      {/* Left side */}
      <div css={topbarLeftSideStyles}>
        {isAdmin && (
          <IconButton href={workspaceHref}>
            <LeftArrow />
          </IconButton>
        )}
        <NotebookPath
          workspaceName={workspaceName}
          notebookName={notebookName}
          workspaceHref={workspaceHref}
        />
      </div>

      {/* Right side */}
      <div css={topbarRightSideStyles}>
        <Anchor href={docs({}).$} css={helpButtonStyles}>
          Need help?
        </Anchor>
        <NotebookAvatars usersWithAccess={usersWithAccess} />
        {isAdmin && (
          <NotebookSharingPopUp onToggleShare={onToggleShare} link={link} />
        )}
        {isNotUser && <Button href="/">Try Decipad</Button>}
      </div>
    </div>
  );
};
