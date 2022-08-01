import { css } from '@emotion/react';
import { Children, FC } from 'react';
import { useAutoAnimate } from '../../hooks';
import { smallestMobile } from '../../primitives';

const styles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0px 52px',
});

const itemStyles = css({
  flexGrow: 1,
  flexBasis: `calc((${smallestMobile.landscape.width}px - 100%) * 999)`,
});

export const EditorColumns: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [animate] = useAutoAnimate<HTMLUListElement>();
  return (
    <ul css={styles} ref={animate}>
      {Children.map(children, (child) => (
        <li css={itemStyles}>{child}</li>
      ))}
    </ul>
  );
};
