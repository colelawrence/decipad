import { css } from '@emotion/react';
import { FC } from 'react';
import { Placeholder } from '../../atoms';
import { NotebookListItemPlaceholder } from '../../molecules';
import { notebookList } from '../../styles';

const styles = css({
  height: '100%',
  overflow: 'hidden',
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  rowGap: '28px',
});

const { gridTemplateColumns } = notebookList;
const headerStyles = css({
  display: 'grid',
  gridTemplateColumns,
  gridTemplateRows: '8px',
});

const numberOfItemPlaceholders = 10;
const bodyStyles = css({
  display: 'grid',
  alignContent: 'start',
  rowGap: '32px',
  overflow: 'hidden',
});

export const NotebookListPlaceholder = (): ReturnType<FC> => {
  return (
    <div aria-label="Notebook list loading" css={styles}>
      <div css={headerStyles}>
        <div css={{ width: '32px' }}>
          <Placeholder lessRound />
        </div>
        <div css={{ width: '32px' }}>
          <Placeholder lessRound />
        </div>
        <div css={{ width: '32px' }}>
          <Placeholder lessRound />
        </div>
      </div>
      <div css={bodyStyles}>
        {Array(numberOfItemPlaceholders)
          .fill(null)
          .map((_, i) => (
            <NotebookListItemPlaceholder key={i} />
          ))}
      </div>
    </div>
  );
};
