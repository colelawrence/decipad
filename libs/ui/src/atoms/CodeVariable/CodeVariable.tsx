import { css } from '@emotion/react';
import { noop } from 'lodash';
import { ReactNode } from 'react';
import { cssVar } from '../../primitives';
import { codeBlock } from '../../styles';

const varStyles = css(codeBlock.variableStyles, {
  padding: '2px 6px',
  borderRadius: '6px',
});

const missingStyles = css({
  backgroundColor: cssVar('unknownIdentifierHighlightColor'),
  color: cssVar('unknownIdentifierHighlightTextColor'),
});

const pointyStylesInW3C = css({ cursor: 'pointer' });

interface CodeVariableProps {
  readonly children: ReactNode;
  readonly variableMissing?: boolean;
  readonly onClick?: () => void;
  readonly setPointyStyles?: boolean;
}
export const CodeVariable = ({
  children,
  variableMissing = false,
  setPointyStyles = false,
  onClick = noop,
}: CodeVariableProps): ReturnType<React.FC> => {
  return (
    <span
      onClick={onClick}
      css={[
        varStyles,
        variableMissing && missingStyles,
        setPointyStyles && pointyStylesInW3C,
      ]}
    >
      {children}
    </span>
  );
};
