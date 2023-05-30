/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p12Medium, setCssVar } from '../../primitives';

const styles = css(
  p12Medium,
  setCssVar('currentTextColor', cssVar('iconColorDark')),
  {
    padding: '4px 8px',
    borderRadius: '6px',
  }
);

export const Badge: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <span css={[styles, { backgroundColor: cssVar('buttonBrandBackground') }]}>
      {children}
    </span>
  );
};
