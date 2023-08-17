/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p13Medium, smallScreenQuery } from '../../primitives';

const wrapperStyles = css({
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  [smallScreenQuery]: {
    display: 'none',
  },
});

const notebookNameStyles = css(p13Medium, {
  color: cssVar('textDefault'),
  cursor: 'default',
});

const anchorStyles = css(notebookNameStyles, {
  textDecoration: 'none',
  cursor: 'pointer',
});

interface NotebookPathProps {
  notebookName: string;
  href?: string;
}

export const NotebookPath = ({
  notebookName: _notebookName,
  href,
}: NotebookPathProps): ReturnType<FC> => {
  const notebookName = getNotebookName(_notebookName);

  return (
    <div css={wrapperStyles}>
      {href ? (
        <a css={anchorStyles} href={href}>
          <em css={anchorStyles}>{notebookName}</em>
        </a>
      ) : (
        <em css={notebookNameStyles}>{notebookName}</em>
      )}
    </div>
  );
};

function getNotebookName(notebookName?: string) {
  if (!notebookName) return 'Unnamed notebook';
  if (notebookName.length >= 20) {
    return `${notebookName.slice(0, 20)}...`;
  }
  return notebookName;
}
