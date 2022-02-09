import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { codeBlock } from '../../styles';

const styles = css(codeBlock.variableStyles, {
  padding: '4px 8px',
  borderRadius: '8px',
});

interface CodeVariableProps {
  readonly children: ReactNode;
}

export const CodeVariable = ({
  children,
}: CodeVariableProps): ReturnType<React.FC> => {
  return <span css={styles}>{children}</span>;
};
