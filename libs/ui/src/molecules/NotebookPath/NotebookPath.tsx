/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p13Medium } from '../../primitives';

const wrapperStyles = css({
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  '@media (max-width: 475px)': {
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
  target?: string;
  concatName?: true;
}

export const NotebookPath = ({
  notebookName: _notebookName,
  href,
  concatName,
}: NotebookPathProps): ReturnType<FC> => {
  const notebookName = concatName
    ? getNotebookName(_notebookName)
    : _notebookName;

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
