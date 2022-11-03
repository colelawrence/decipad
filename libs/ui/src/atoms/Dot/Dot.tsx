import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, orange500 } from '../../primitives';

const styles = css({
  position: 'relative',
  display: 'inline-flex',

  '::before': {
    position: 'absolute',

    top: -5,
    right: -5,

    border: `2px solid ${cssVar('backgroundColor')}`,
    borderRadius: '50%',
    width: '10px',
    height: '10px',

    backgroundColor: orange500.rgb,

    content: '" "',
  },
});

export const Dot: FC<{ children: ReactNode }> = ({ children }) => (
  <span css={styles}>{children}</span>
);
