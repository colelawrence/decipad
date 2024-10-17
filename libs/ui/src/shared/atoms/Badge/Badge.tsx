import { SerializedStyles, css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p12Medium } from '../../../primitives';

const defaultStyles = css(
  p12Medium,

  {
    backgroundColor: cssVar('borderDefault'),
    color: cssVar('textDefault'),
    padding: '4px 8px',
    borderRadius: '6px',
  }
);

export interface BadgeProps {
  styles?: SerializedStyles;
  children: ReactNode;
}

export const Badge: FC<BadgeProps> = ({ children, styles: extraStyles }) => {
  const styles = [defaultStyles, extraStyles];
  return <span css={styles}>{children}</span>;
};
