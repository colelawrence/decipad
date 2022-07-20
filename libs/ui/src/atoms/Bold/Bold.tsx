import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { p16Bold } from '../../primitives';

const styles = css(p16Bold, { fontStyle: 'inherit' });

interface BoldProps {
  readonly children: ReactNode;
}
export const Bold = ({ children }: BoldProps): ReturnType<React.FC> => {
  return <span css={styles}>{children}</span>;
};
