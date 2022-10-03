import { FC, ReactNode, Children } from 'react';
import { css } from '@emotion/react';
import { listItemCounter } from '../../utils';
import { cssVar, p16Regular, setCssVar } from '../../primitives';

// Note on counters: This could just be counter-reset on the ol, counter-increment on the li::before, but Safari can't handle pseudo elements

const styles = css({
  display: 'grid',
  gridTemplateColumns: 'minmax(24px, auto) 1fr 0px',
  gridAutoFlow: 'row',

  rowGap: '6px',
  columnGap: '8px',

  counterReset: listItemCounter,
  counterIncrement: listItemCounter,
  wordBreak: 'break-word',
});

const itemStyles = css({
  display: 'contents',

  '::before': {
    ...p16Regular,
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    textAlign: 'center',

    content: `counter(${listItemCounter}) "."`,
  },
  '::after': {
    counterIncrement: listItemCounter,
    content: '" "',
  },
});

type OrderedListProps = {
  readonly children?: ReactNode;
};
export const OrderedList = ({ children }: OrderedListProps): ReturnType<FC> => {
  return (
    <ol css={styles}>
      {Children.map(children, (child) => (
        <li css={itemStyles}>{child}</li>
      ))}
    </ol>
  );
};
