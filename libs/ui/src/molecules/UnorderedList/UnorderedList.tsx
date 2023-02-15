import { FC, ReactNode, Children, createContext, useContext } from 'react';
import { css } from '@emotion/react';
import { cssVar, p16Regular, setCssVar } from '../../primitives';
import { Bullet } from '../../icons';

const Depth = createContext(0);

const styles = css({
  display: 'grid',
  gridTemplateColumns: '24px 1fr',
  gridAutoFlow: 'row',

  rowGap: '6px',
  columnGap: '8px',

  wordBreak: 'break-word',
});

const itemStyles = css({
  display: 'contents',
});

const bulletStyles = css({
  justifySelf: 'center',
  // align vertically with the first line, even if the item is multiline
  alignSelf: 'start',

  width: '6px',
  height: `calc(${p16Regular.lineHeight} * ${p16Regular.fontSize})`,

  display: 'grid',
  alignContent: 'center',
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
});

type UnorderedListProps = {
  readonly children?: ReactNode;
};
export const UnorderedList = ({
  children,
}: UnorderedListProps): ReturnType<FC> => {
  const depth = useContext(Depth) + 1;

  return (
    <ul css={styles}>
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
    </ul>
  );
};
