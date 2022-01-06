import { FC, ReactNode, Children } from 'react';
import { css } from '@emotion/react';
import { listItemCounter } from '../../utils';
import { cssVar, p16Regular, setCssVar } from '../../primitives';

const styles = css({
  display: 'grid',
  gridTemplateColumns: 'minmax(24px, auto) 1fr',
  gridAutoFlow: 'row',

  padding: '6px 0',
  'li &': {
    paddingBottom: 0,
  },
  rowGap: '6px',
  columnGap: '8px',

  counterReset: listItemCounter,
});

const itemStyles = css({
  display: 'contents',

  '::before': {
    ...p16Regular,
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    textAlign: 'center',

    counterIncrement: listItemCounter,
    content: `counter(${listItemCounter}) "."`,
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
