import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { BackButton } from '../../atoms';
import { NotebookPath } from '../../molecules';
import { NotebookSharingPopUp, NotebookUsers } from '../../organisms';
import { noop } from '../../utils';

const topbarWrapperStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const topbarSideStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
});

export type NotebookTopbarProps = Pick<
  ComponentProps<typeof NotebookPath>,
  'workspaceName' | 'notebookName'
> &
  Pick<ComponentProps<typeof NotebookUsers>, 'users'> & {
    workspaceHref: string;
    isAdmin: boolean;
    link: string;
    onToggleShare?: () => void;
  };

export const NotebookTopbar = ({
  workspaceName,
  notebookName,
  users,
  isAdmin,
  onToggleShare = noop,
  link,
  workspaceHref,
}: NotebookTopbarProps): ReturnType<FC> => {
  return (
    <div css={topbarWrapperStyles}>
      {/* Left side */}
      <div css={topbarSideStyles}>
        {isAdmin && <BackButton href={workspaceHref} />}
        <NotebookPath
          workspaceName={workspaceName}
          notebookName={notebookName}
          workspaceHref={workspaceHref}
        />
      </div>

      {/* Right side */}
      <div css={topbarSideStyles}>
        <NotebookUsers users={users} />
        {isAdmin && (
          <NotebookSharingPopUp onToggleShare={onToggleShare} link={link} />
        )}
      </div>
    </div>
  );
};
