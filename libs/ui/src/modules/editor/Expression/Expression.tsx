/* eslint decipad/css-prop-named-variable: 0 */
import { type SerializedType } from '@decipad/language-interfaces';
import { css } from '@emotion/react';
import { ComponentProps, FC, ReactNode, useEffect, useRef } from 'react';
import { CodeError } from '../CodeError/CodeError';
import {
  Opacity,
  cssVar,
  display,
  hoverTransitionStyles,
  p24Medium,
} from '../../../primitives';
import { useSwatchColor } from 'libs/ui/src/utils';
import { AvailableSwatchColor } from '@decipad/editor-types';
import { Calendar, Edit } from 'libs/ui/src/icons';

const baseWrapperStyles = css({
  width: '100%',
  display: 'grid',
  overflow: 'hidden',
  alignItems: 'center',
  minHeight: '40px',
});

const expressionInputStyles = css(
  {
    borderRadius: '8px',
    minWidth: 0,
    padding: '0 6px',
    fontSize: '14px',
    minHeight: '40px',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: `1px solid ${cssVar('borderSubdued')}`,
    position: 'relative',
    '&[data-kind="date"], &[data-kind="string"]': {
      fontWeight: 500,
      fontSize: 24,
    },
    ':hover': {
      backgroundColor: cssVar('backgroundHeavy'),
    },
  },
  hoverTransitionStyles('background-color')
);

const focusedExpressionInputStyles = css({
  backgroundColor: cssVar('backgroundDefault'),
});

const placeholderOpacity: Opacity = 0.4;

const placeholderStyles = css({
  cursor: 'text',

  // overlap content (blinking caret) and placeholder
  display: 'grid',
  '> span, ::before': {
    gridArea: '1 / 1',
  },
  '::before': {
    ...display,
    ...p24Medium,

    pointerEvents: 'none',
    content: 'attr(aria-placeholder)',
    opacity: placeholderOpacity,
  },
});

const lineStyles = css({
  whiteSpace: 'pre',
  overflow: 'hidden',
  scrollSnapAlign: 'start',

  '[data-kind="date"] &': {
    marginRight: 24,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

const errorContainerStyles = css({
  alignSelf: 'center',
  justifySelf: 'center',
});

const iconWrapperStyles = css({
  width: '16px',
  height: '16px',
  position: 'absolute',
  right: 8,
  color: cssVar('textDefault'),
});

export interface VariableEditorProps {
  type?: SerializedType;
  error?: ComponentProps<typeof CodeError>;
  focused?: boolean;
  placeholder?: string;
  children?: ReactNode;
  color?: AvailableSwatchColor;
}

export const Expression = ({
  type,
  error,
  focused = false,
  placeholder = '',
  children,
  color: colorProp = 'Catskill',
}: VariableEditorProps): ReturnType<FC> => {
  const inputRef = useRef<HTMLSpanElement | null>(null);
  const swatchColor = useSwatchColor(colorProp, 'vivid', 'base');

  useEffect(() => {
    if (inputRef.current && !focused) {
      inputRef.current.scrollLeft = 0;
    }
  }, [focused]);

  return (
    <div
      css={[
        baseWrapperStyles,
        { gridTemplateColumns: error ? '1fr 24px' : '1fr' },
      ]}
    >
      <div
        role="textbox"
        css={[
          expressionInputStyles,
          placeholderStyles,
          focused && focusedExpressionInputStyles,
          (type?.kind === 'date' || type?.kind === 'string') && {
            color: swatchColor.hex,
          },
        ]}
        data-kind={type?.kind ?? 'string'}
        aria-placeholder={placeholder}
      >
        <span data-testid="widget-input" css={lineStyles} ref={inputRef}>
          {children}
        </span>
        <div css={iconWrapperStyles}>
          {type?.kind === 'date' ? <Calendar /> : <Edit />}
        </div>
      </div>

      {error && (
        <div contentEditable={false} css={errorContainerStyles}>
          <CodeError {...error} />
        </div>
      )}
    </div>
  );
};
