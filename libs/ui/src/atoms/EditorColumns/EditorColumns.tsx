import { css } from '@emotion/react';
import { Children, FC } from 'react';
import { smallestDesktop } from '../../primitives';

const styles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '52px',
});

const itemStyles = css({
  flexGrow: 1,
  flexBasis: `calc((${smallestDesktop.portrait.width}px - 100%) * 999)`,
});

export const EditorColumns: FC = ({ children }) => {
  return (
    <ul css={styles}>
      {Children.map(children, (child) => (
        <li css={itemStyles}>{child}</li>
      ))}
    </ul>
  );
};
