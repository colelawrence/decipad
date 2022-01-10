import { css } from '@emotion/react';
import { ReactNode } from 'react';

const styles = css({ textDecoration: 'underline' });

interface UnderlineProps {
  readonly children: ReactNode;
}
export const Underline = ({
  children,
}: UnderlineProps): ReturnType<React.FC> => {
  return <span css={styles}>{children}</span>;
};
