/* eslint decipad/css-prop-named-variable: 0 */
import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { Tooltip } from '../../atoms';
import { red600 } from '../../primitives';

const highlightStyles = css({
  borderBottom: `1px dotted ${red600.rgb}`,
  color: red600.rgb,
});

interface SyntaxErrorHighlightProps {
  children: ReactNode;
  variant?: 'mismatched-brackets' | 'never-closed' | 'never-opened' | 'custom';
  error?: string;
  hideError?: boolean;
}

export const SyntaxErrorHighlight = ({
  children,
  variant,
  error,
  hideError,
}: SyntaxErrorHighlightProps): ReturnType<FC> => {
  if (hideError) {
    // Retain DOM structure for error highlighting
    // To avoid jumping cursor when an error is fixed or caused around it.
    // This keeps happening. Please do not undo.
    return (
      <Tooltip
        trigger={<span css={[]}>{children}</span>}
        open={false}
      ></Tooltip>
    );
  }

  return (
    <Tooltip trigger={<span css={highlightStyles}>{children}</span>}>
      {variant === 'never-closed' && 'Did you forget to close this bracket?'}
      {variant === 'never-opened' && 'Did you forget the opening bracket?'}
      {variant === 'mismatched-brackets' &&
        'This bracket does not match the other one.'}
      {(variant === 'custom' && error) ?? 'Unknown error'}
      {variant == null && 'This character is invalid here'}
    </Tooltip>
  );
};
