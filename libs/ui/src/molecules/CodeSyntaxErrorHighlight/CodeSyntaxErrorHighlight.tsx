import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { Tooltip } from '../../atoms';
import { red600 } from '../../primitives';

const highlightStyles = css({
  borderBottom: `1px dotted ${red600.rgb}`,
  color: red600.rgb,
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
      {variant === 'never-closed' && 'Did you forget to close this bracket?'}
      {variant === 'never-opened' && 'Did you forget the opening bracket?'}
      {variant === 'mismatched-brackets' &&
        'This bracket does not match the other one.'}
      {variant == null && 'This character is invalid here'}
    </Tooltip>
  );
};
