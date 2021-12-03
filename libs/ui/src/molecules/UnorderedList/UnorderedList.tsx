import { FC, ReactNode, Children } from 'react';
import { css } from '@emotion/react';
import { listItemCounter, SlateElementProps } from '../../utils';
import { cssVar, setCssVar } from '../../primitives';
import { Bullet } from '../../icons';

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
  counterIncrement: listItemCounter,
});

const bulletStyles = css({
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),

  display: 'flex',
  justifySelf: 'center',
  width: '3px',

  // align vertically with the first line, even if the item is multiline
  alignSelf: 'start',
  '::before': {
    content: '" "',
    width: 0,
    visibility: 'hidden',
  },
});

type UnorderedListProps = SlateElementProps & {
  readonly children?: ReactNode;
};
export const UnorderedList = ({
  children,
  slateAttrs,
}: UnorderedListProps): ReturnType<FC> => {
  return (
    <ol css={styles} {...slateAttrs}>
      {Children.map(children, (child) => (
        <li css={itemStyles}>
          <span role="presentation" contentEditable={false} css={bulletStyles}>
            <Bullet />
          </span>
          {child}
        </li>
      ))}
    </ol>
  );
};
