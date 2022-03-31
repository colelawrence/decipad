import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { setCssVar, grey400, p32Medium } from '../../primitives';

const inputStyles = css(p32Medium, {});

const placeholderStyles = css({
  cursor: 'text',

  // overlap content (blinking caret) and placeholder
  display: 'grid',
  '> span, ::before': {
    gridArea: '1 / 1',
  },
  '::before': {
    ...p32Medium,
    ...setCssVar('currentTextColor', grey400.rgb),
    pointerEvents: 'none',

    content: 'attr(aria-placeholder)',
  },
});

interface EditableExpressionProps {
  focused: boolean;
  children: ReactNode;
  content: string;
}

export const EditableExpression = ({
  focused,
  children,
  content,
}: EditableExpressionProps): ReturnType<FC> => {
  return (
    <div
      css={[inputStyles, placeholderStyles]}
      aria-placeholder={!content && focused ? '1 km' : ''}
    >
      {children}
    </div>
  );
};
