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
      variant ? cssVar('weakTextColor') : cssVar('borderHighlightColor')
    }`,
    background: variant ? cssVar('normalTextColor') : cssVar('backgroundColor'),
    color: variant ? cssVar('weakerTextColor') : cssVar('normalTextColor'),
    margin: '0 2px',
  });
};
