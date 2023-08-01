/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar } from '../../primitives';

interface KeyboardKeyProps {
  readonly children: ReactNode;
  readonly variant?: boolean;
}

export const KeyboardKey = ({
  children,
  variant = false,
}: KeyboardKeyProps): ReturnType<React.FC> => {
  return <div css={keyboardKeyStyles(variant)}>{children}</div>;
};

const keyboardKeyStyles = (variant: boolean) => {
  return css({
    display: 'inline-flex',
    padding: '0 4px',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: `1px solid ${
      variant ? cssVar('textSubdued') : cssVar('borderDefault')
    }`,
    background: variant ? cssVar('textDefault') : cssVar('backgroundMain'),
    color: variant ? cssVar('textDisabled') : cssVar('textDefault'),
    margin: '0 2px',
  });
};
