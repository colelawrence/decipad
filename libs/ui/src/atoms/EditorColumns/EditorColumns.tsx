import { css } from '@emotion/react';
import { Children, FC } from 'react';
import { slimBlockWidth } from '../../styles/editor-layout';

const styles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0px 52px',
});

const itemStyles = css({
  flexGrow: 1,
  flexBasis: `calc((${slimBlockWidth}px - 100%) * 999)`,
});

export const EditorColumns: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <ul css={styles}>
      {Children.map(children, (child) => (
        <li css={itemStyles}>{child}</li>
      ))}
    </ul>
  );
};
