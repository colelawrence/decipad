import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { SlateLeafProps } from '../../utils';

const styles = css({ textDecoration: 'line-through' });

interface StrikethroughProps extends SlateLeafProps {
  readonly children: ReactNode;
}
export const Strikethrough = ({
  children,
}: StrikethroughProps): ReturnType<React.FC> => {
  return <span css={styles}>{children}</span>;
};
