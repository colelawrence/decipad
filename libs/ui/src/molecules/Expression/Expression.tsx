/* eslint decipad/css-prop-named-variable: 0 */
import { SerializedType } from '@decipad/language';
import { css } from '@emotion/react';
import { ComponentProps, FC, ReactNode, useEffect, useRef } from 'react';
import { CodeError } from '../../atoms';
import {
  Opacity,
  cssVar,
  display,
  p24Medium,
  setCssVar,
  smallScreenQuery,
} from '../../primitives';

const baseWrapperStyles = css({
  width: '100%',
  display: 'grid',
  overflow: 'hidden',
  alignItems: 'center',
  minHeight: '40px',
});

const expressionInputStyles = css({
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  borderRadius: '8px',
  minWidth: 0,
  padding: '0 8px',
  fontSize: '14px',
  minHeight: '40px',
  alignItems: 'center',
  ':hover': {
    backgroundColor: cssVar('highlightColor'),
  },
});

const focusedExpressionInputStyles = css({
  backgroundColor: cssVar('highlightColor'),
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
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    pointerEvents: 'none',
    content: 'attr(aria-placeholder)',
    opacity: placeholderOpacity,

    [smallScreenQuery]: p24Medium,
  },

  [smallScreenQuery]: p24Medium,
});

const lineStyles = css({
  whiteSpace: 'pre',
  overflow: 'hidden',
  scrollSnapAlign: 'start',
  fontVariantNumeric: 'tabular-nums',
});

const errorContainerStyles = css({
  alignSelf: 'center',
  justifySelf: 'center',
});

interface VariableEditorProps {
  type?: SerializedType;
  error?: ComponentProps<typeof CodeError>;
  focused?: boolean;
  placeholder?: string;
  children?: ReactNode;
}

export const Expression = ({
  type,
  error,
  focused = false,
  placeholder = '',
  children,
}: VariableEditorProps): ReturnType<FC> => {
  const inputRef = useRef<HTMLSpanElement | null>(null);
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
        css={[
          expressionInputStyles,
          (type?.kind === 'date' || type?.kind === 'string') && {
            fontWeight: 500,
            fontSize: 24,
            color: cssVar('strongTextColor'),
          },
          placeholderStyles,
          focused && focusedExpressionInputStyles,
        ]}
        aria-placeholder={placeholder}
      >
        <span data-testid="widget-input" css={lineStyles} ref={inputRef}>
          {children}
        </span>
      </div>
      {error && (
        <div contentEditable={false} css={errorContainerStyles}>
          <CodeError {...error} />
        </div>
      )}
    </div>
  );
};
