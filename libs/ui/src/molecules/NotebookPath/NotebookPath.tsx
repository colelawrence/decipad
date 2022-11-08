import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p14Medium, smallestMobile } from '../../primitives';

const smallestScreenQuery = `@media (max-width: ${smallestMobile.landscape.width}px)`;

const wrapperStyles = css({
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  [smallestScreenQuery]: {
    display: 'none',
  },
});

const workspaceNameStyles = css(p14Medium, {
  color: cssVar('weakTextColor'),
  cursor: 'default',
});

const notebookNameStyles = css(p14Medium, {
  color: cssVar('currentTextColor'),
  cursor: 'default',
});

const anchorStyles = css({
  textDecoration: 'none',
  cursor: 'pointer',
});

interface NotebookPathProps {
  notebookName: string;
  workspaceName?: string;
  href?: string;
}

export const NotebookPath = ({
  notebookName: _notebookName,
  workspaceName,
  href,
}: NotebookPathProps): ReturnType<FC> => {
  const notebookName = _notebookName || '<unnamed-notebook>';
  const link = href ? (
    <a css={anchorStyles} href={href}>
      <em css={[notebookNameStyles, anchorStyles]}>{notebookName}</em>
    </a>
  ) : (
    <em css={notebookNameStyles}>{notebookName}</em>
  );
  return (
    <div css={wrapperStyles}>
      {workspaceName && <em css={workspaceNameStyles}>{workspaceName} / </em>}
      {link}
    </div>
  );
};
