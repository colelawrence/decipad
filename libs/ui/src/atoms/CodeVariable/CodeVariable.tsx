import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { code, codeBubbleBackground, codeBubbleText } from '../../primitives';

const styles = css(code, {
  color: codeBubbleText.rgb,
  backgroundColor: codeBubbleBackground.rgb,
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
