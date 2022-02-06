import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { Tooltip } from '../../atoms';
import { codeErrorIconFill } from '../../primitives';

const highlightStyles = css({
  borderBottom: `1px dotted ${codeErrorIconFill.rgb}`,
  color: codeErrorIconFill.rgb,
});

interface CodeSyntaxErrorHighlightProps {
  children: ReactNode;
  variant?: 'mismatched-brackets' | 'never-closed' | 'never-opened';
}

export const CodeSyntaxErrorHighlight = ({
  children,
  variant,
}: CodeSyntaxErrorHighlightProps): ReturnType<FC> => {
  return (
    <Tooltip trigger={<span css={highlightStyles}>{children}</span>}>
      {variant === 'never-closed' &&
        'This bracket was never closed. Did you forget the closing bracket "]" or typed too many brackets?'}
      {variant === 'never-opened' &&
        'This bracket was never opened. Did you forget the opening bracket "[" or typed too many brackets?'}
      {variant === 'mismatched-brackets' &&
        'This bracket does not match the other one.'}
      {variant == null && 'This character is invalid here'}
    </Tooltip>
  );
};
