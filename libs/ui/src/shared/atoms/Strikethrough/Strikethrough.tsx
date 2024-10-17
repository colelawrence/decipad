import { css } from '@emotion/react';
import { ReactNode } from 'react';

const styles = css({ textDecoration: 'line-through' });

export interface StrikethroughProps {
  readonly children: ReactNode;
}
export const Strikethrough = ({
  children,
}: StrikethroughProps): ReturnType<React.FC> => {
  return <span css={styles}>{children}</span>;
};
