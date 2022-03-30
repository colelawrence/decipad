import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { codeBlock } from '../../styles';

const styles = css(codeBlock.variableStyles, {
  padding: '4px 8px',
  borderRadius: '8px',
});

interface CodeVariableProps {
  readonly children: ReactNode;
  readonly variableMissing?: boolean;
}

export const CodeVariable = ({
  children,
  variableMissing = false,
}: CodeVariableProps): ReturnType<React.FC> => {
  return <span css={variableMissing ? null : styles}>{children}</span>;
};
