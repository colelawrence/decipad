import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar } from '../../primitives';
import { codeBlock } from '../../styles';

const varStyles = css(codeBlock.variableStyles, {
  padding: '2px 6px',
  borderRadius: '6px',
});

const missingStyles = css({
  backgroundColor: cssVar('missingVariableHighlightColor'),
});

interface CodeVariableProps {
  readonly children: ReactNode;
  readonly variableMissing?: boolean;
}
export const CodeVariable = ({
  children,
  variableMissing = false,
}: CodeVariableProps): ReturnType<React.FC> => {
  return (
    <span css={[varStyles, variableMissing && missingStyles]}>{children}</span>
  );
};
