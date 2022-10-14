import { SerializedType } from '@decipad/language';
import { css } from '@emotion/react';
import { FC, ReactNode, ComponentProps, useEffect, useRef } from 'react';
import { CodeError } from '../../atoms';
import {
  cssVar,
  display,
  Opacity,
  p15Regular,
  p24Medium,
  p32Medium,
  setCssVar,
  smallestDesktop,
} from '../../primitives';

const smallScreenQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;

const baseWrapperStyles = css({
  width: '100%',
  display: 'grid',
  overflow: 'hidden',
});

const expressionInputStyles = css({
  color: cssVar('strongTextColor'),
  borderRadius: '8px',
  minWidth: 0,
  padding: '0 8px',
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
    ...p32Medium,
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
          type?.kind !== 'date' ? p32Medium : p15Regular,
          expressionInputStyles,
          placeholderStyles,
          focused && focusedExpressionInputStyles,
        ]}
        aria-placeholder={placeholder}
      >
        <span css={lineStyles} ref={inputRef}>
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
