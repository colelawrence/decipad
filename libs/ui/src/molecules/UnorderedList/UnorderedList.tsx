import { FC, ReactNode, Children, createContext, useContext } from 'react';
import { css } from '@emotion/react';
import { listItemCounter } from '../../utils';
import { cssVar, setCssVar } from '../../primitives';
import { Bullet } from '../../icons';

const Depth = createContext(0);

const styles = css({
  display: 'grid',
  gridTemplateColumns: '24px 1fr',
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

  justifySelf: 'center',
  display: 'flex',
  width: '6px',

  // align vertically with the first line, even if the item is multiline
  alignSelf: 'start',
  '::before': {
    content: '" "',
    whiteSpace: 'pre',
    width: 0,
    visibility: 'hidden',
  },
});

type UnorderedListProps = {
  readonly children?: ReactNode;
};
export const UnorderedList = ({
  children,
}: UnorderedListProps): ReturnType<FC> => {
  const depth = useContext(Depth) + 1;

  return (
    <ol css={styles}>
      <Depth.Provider value={depth}>
        {Children.map(children, (child) => (
          <li css={itemStyles}>
            <span
              role="presentation"
              contentEditable={false}
              css={bulletStyles}
            >
              <Bullet depth={depth} />
            </span>
            {child}
          </li>
        ))}
      </Depth.Provider>
    </ol>
  );
};
