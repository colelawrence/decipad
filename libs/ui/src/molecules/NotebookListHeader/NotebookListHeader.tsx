import { css } from '@emotion/react';
import { FC } from 'react';
import { Placeholder } from '../../atoms';

import { p12Regular, p15Medium } from '../../primitives';

const styles = css({
  display: 'flex',
  columnGap: '8px',

  flexWrap: 'wrap',
  rowGap: '4px',
});

interface NotebookListHeaderProps {
  readonly Heading: 'h1';
  readonly numberOfNotebooks?: number;
}

export const NotebookListHeader = ({
  Heading,
  numberOfNotebooks,
}: NotebookListHeaderProps): ReturnType<FC> => {
  return (
    <div css={styles}>
      <Heading css={css(p15Medium)}>All Notebooks</Heading>
      {typeof numberOfNotebooks === 'number' ? (
        <em css={css(p12Regular, { alignSelf: 'flex-end' })}>
          {numberOfNotebooks} result{numberOfNotebooks === 1 || 's'}
        </em>
      ) : (
        <div
          css={{ width: '48px', height: '8px', alignSelf: 'center' }}
          aria-label="Notebooks loading"
        >
          <Placeholder lessRound />
        </div>
      )}
    </div>
  );
};
