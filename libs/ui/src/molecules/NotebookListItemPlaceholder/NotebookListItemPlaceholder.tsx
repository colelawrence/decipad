import { css } from '@emotion/react';
import { FC } from 'react';
import { Placeholder } from '../../atoms';
import { notebookList } from '../../styles';

const { gridTemplateColumns } = notebookList;
const styles = css({
  display: 'grid',
  gridTemplateColumns,
  alignItems: 'end',
});

const leftStyles = css({
  paddingRight: '80px',

  display: 'grid',
  gridTemplateColumns: '32px 1fr',
  columnGap: '14px',
});

const twoRowStyles = css({
  padding: '3px 0',
  display: 'grid',
  grid: `
    "top    .     " 12px
    "bottom bottom" 12px
    / ${124 / 440}fr ${(440 - 124) / 440}fr
  `,
  rowGap: '12px',
});

const middleAndRightStyles = css({
  padding: '3px 0',

  boxSizing: 'content-box',
  height: '12px',
  maxWidth: '64px',

  display: 'grid',
});

export const NotebookListItemPlaceholder = (): ReturnType<FC> => {
  return (
    <div role="presentation" css={styles}>
      <div css={leftStyles}>
        <Placeholder />
        <div css={twoRowStyles}>
          <div css={{ gridArea: 'top', display: 'grid' }}>
            <Placeholder />
          </div>
          <div css={{ gridArea: 'bottom', display: 'grid' }}>
            <Placeholder />
          </div>
        </div>
      </div>
      <div css={middleAndRightStyles}>
        <Placeholder />
      </div>
      <div css={middleAndRightStyles}>
        <Placeholder />
      </div>
    </div>
  );
};
