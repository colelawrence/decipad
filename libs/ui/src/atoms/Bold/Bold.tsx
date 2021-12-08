import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { p16Bold } from '../../primitives';
import { SlateLeafProps } from '../../utils';

const styles = css(p16Bold);

interface BoldProps extends SlateLeafProps {
  readonly children: ReactNode;
}
export const Bold = ({ children }: BoldProps): ReturnType<React.FC> => {
  return <span css={styles}>{children}</span>;
};
