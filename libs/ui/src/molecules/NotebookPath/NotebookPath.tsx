import { css } from '@emotion/react';
import { FC } from 'react';
import { Slash } from '../../icons';
import { cssVar, p15Medium, setCssVar } from '../../primitives';
import { Anchor } from '../../utils';

const workspaceNameStyles = css(p15Medium, {
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  marginLeft: '0.5rem',
});

const notebookNameStyles = css(p15Medium, {
  color: cssVar('currentTextColor'),
  cursor: 'default',
});

const iconStyles = css({
  width: '12px',
  height: '12px',
  display: 'inline-block',
  marginBottom: '6px',
});

interface NotebookPathProps {
  isAdmin: boolean;
  workspaceName: string;
  notebookName: string;
  workspaceHref: string;
}

export const NotebookPath = ({
  isAdmin,
  workspaceName,
  notebookName,
  workspaceHref,
}: NotebookPathProps): ReturnType<FC> => {
  return (
    <div css={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {isAdmin ? (
        <Anchor href={workspaceHref} css={workspaceNameStyles}>
          {workspaceName}
        </Anchor>
      ) : (
        <em css={css([workspaceNameStyles, { cursor: 'default' }])}>
          {workspaceName}
        </em>
      )}
      <div css={iconStyles}>
        <Slash />
      </div>
      <em css={notebookNameStyles}>{notebookName}</em>
    </div>
  );
};
