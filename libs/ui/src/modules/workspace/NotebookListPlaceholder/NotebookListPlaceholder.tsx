/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';

import { NotebookListItemPlaceholder } from '../NotebookListItemPlaceholder/NotebookListItemPlaceholder';
import { notebookList } from '../../../styles';

const styles = css({
  height: '100%',
  overflow: 'hidden',
  padding: `${notebookList.verticalPadding} ${notebookList.horizontalPadding}`,
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  rowGap: '28px',
});

const numberOfItemPlaceholders = 10;

const bodyStyles = css({
  display: 'grid',
  alignContent: 'start',
  rowGap: '32px',
  overflow: 'hidden',
});

export const NotebookListPlaceholder: React.FC<{
  bgColour?: 'default' | 'heavy';
}> = ({ bgColour = 'default' }) => {
  return (
    <div aria-label="Notebook list loading" css={styles}>
      <ol css={bodyStyles}>
        {Array(numberOfItemPlaceholders)
          .fill(null)
          .map((_, i) => (
            <NotebookListItemPlaceholder key={i} pos={i} bgColour={bgColour} />
          ))}
      </ol>
    </div>
  );
};
