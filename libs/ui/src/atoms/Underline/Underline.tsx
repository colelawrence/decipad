import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { SlateLeafProps } from '../../utils';

const styles = css({ textDecoration: 'underline' });

interface UnderlineProps extends SlateLeafProps {
  readonly children: ReactNode;
}
export const Underline = ({
  children,
}: UnderlineProps): ReturnType<React.FC> => {
  return <span css={styles}>{children}</span>;
};
