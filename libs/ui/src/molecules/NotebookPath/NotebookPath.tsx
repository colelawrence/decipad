/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p14Medium, smallScreenQuery } from '../../primitives';

const wrapperStyles = css({
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  [smallScreenQuery]: {
    display: 'none',
  },
});

const workspaceNameStyles = css(p14Medium, {
  color: cssVar('textSubdued'),
  cursor: 'default',
});

const notebookNameStyles = css(p14Medium, {
  color: cssVar('textDefault'),
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
  const notebookName = _notebookName || 'Unnamed notebook';
  return (
    <div css={wrapperStyles}>
      {href ? (
        <a css={anchorStyles} href={href}>
          <em css={[notebookNameStyles, anchorStyles]}>{notebookName}</em>
        </a>
      ) : (
        <em css={workspaceNameStyles}>{workspaceName}</em>
      )}
    </div>
  );
};
