import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p15Medium, smallestMobile } from '../../primitives';

const smallestScreenQuery = `@media (max-width: ${smallestMobile.landscape.width}px)`;

const wrapperStyles = css({
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  [smallestScreenQuery]: {
    display: 'none',
  },
});

const notebookNameStyles = css(p15Medium, {
  color: cssVar('currentTextColor'),
  cursor: 'default',
});

interface NotebookPathProps {
  notebookName: string;
}

export const NotebookPath = ({
  notebookName,
}: NotebookPathProps): ReturnType<FC> => {
  return (
    <div css={wrapperStyles}>
      <em css={notebookNameStyles}>{notebookName || '<unnamed-notebook>'}</em>
    </div>
  );
};
