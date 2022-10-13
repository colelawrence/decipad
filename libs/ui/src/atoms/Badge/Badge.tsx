import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { brand400, cssVar, p12Medium, setCssVar } from '../../primitives';

const styles = css(
  p12Medium,
  setCssVar('currentTextColor', cssVar('iconColorDark')),
  {
    padding: '4px 8px',
    borderRadius: '6px',

    backgroundColor: brand400.rgb,
  }
);

export const Badge: FC<{ children: ReactNode }> = ({ children }) => {
  return <span css={styles}>{children}</span>;
};
