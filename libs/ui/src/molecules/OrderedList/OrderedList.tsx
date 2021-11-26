import { FC, ReactNode, Children } from 'react';
import { css } from '@emotion/react';
import { listItemCounter, SlateElementProps } from '../../utils';
import { cssVar, p16Regular, setCssVar } from '../../primitives';

const styles = css({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gridAutoFlow: 'row',

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

type OrderedListProps = SlateElementProps & {
  readonly children?: ReactNode;
};
export const OrderedList = ({
  children,
  slateAttrs,
}: OrderedListProps): ReturnType<FC> => {
  return (
    <ol css={styles} {...slateAttrs}>
      {Children.map(children, (child) => (
        <li css={itemStyles}>{child}</li>
      ))}
    </ol>
  );
};
