import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { code, teal50, teal600 } from '../../primitives';

const styles = css(code, {
  color: teal600.rgb,
  backgroundColor: teal50.rgb,
  padding: `4px`,
  borderRadius: '4px',
  margin: '0 6px',
});

interface CodeProps {
  readonly children: ReactNode;
}
export const Code = ({ children }: CodeProps): ReturnType<React.FC> => {
  return <code css={styles}>{children}</code>;
};
