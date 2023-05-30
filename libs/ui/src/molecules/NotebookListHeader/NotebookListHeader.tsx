/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import { Counter, Placeholder } from '../../atoms';

import { p12Regular, p15Medium } from '../../primitives';

const notebookListHeaderWrapperStyles = css({
  display: 'flex',
  columnGap: '8px',

  flexWrap: 'wrap',
  rowGap: '4px',
  alignItems: 'center',
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
    <div css={notebookListHeaderWrapperStyles}>
      <Heading css={css(p15Medium)}>Notebooks</Heading>
      {typeof numberOfNotebooks === 'number' ? (
        <span css={css(p12Regular, { alignSelf: 'flex-end' })}>
          <Counter n={numberOfNotebooks} />
        </span>
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
