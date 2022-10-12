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

interface NotebookPathProps {
  notebookName: string;
  workspaceName?: string;
}

export const NotebookPath = ({
  notebookName,
  workspaceName,
}: NotebookPathProps): ReturnType<FC> => {
  return (
    <div css={wrapperStyles}>
      {workspaceName && <em css={workspaceNameStyles}>{workspaceName} / </em>}
      <em css={notebookNameStyles}>{notebookName || '<unnamed-notebook>'}</em>
    </div>
  );
};
