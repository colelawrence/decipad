import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { code, teal50, teal600 } from '../../primitives';

const styles = css(code, {
  color: teal600.rgb,
  backgroundColor: teal50.rgb,
  borderRadius: '8px',
  padding: '4px 8px',
});

interface CodeVariableProps {
  readonly children: ReactNode;
}

export const CodeVariable = ({
  children,
}: CodeVariableProps): ReturnType<React.FC> => {
  return <span css={styles}>{children}</span>;
};
