import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { code, cssVar, p16Regular } from '../../primitives';

const styles = css(code, {
  backgroundColor: cssVar('highlightColor'),
  borderRadius: '100vmax',
  padding: `calc((${p16Regular.fontSize} - ${code.fontSize}) / 2)`,
  margin: '0 6px',
});

interface CodeProps {
  readonly children: ReactNode;
}
export const Code = ({ children }: CodeProps): ReturnType<React.FC> => {
  return <code css={styles}>{children}</code>;
};
