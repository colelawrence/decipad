/* eslint decipad/css-prop-named-variable: 0 */
import { css, SerializedStyles } from '@emotion/react';
import { cssVar, hoverTransitionStyles } from 'libs/ui/src/primitives';
import { ReactNode, useCallback, useState } from 'react';

const bottomBarSize = 2;

const initialFontSize = 24;
const initialFontSizeHeight = 120;
const initialLineHeight = 33;
const finalFontSize = 48;
const finalFontSizeHeight = 186;
const finalLineHeight = 65;

const fontSizeGradient =
  (finalFontSize - initialFontSize) /
  (finalFontSizeHeight - initialFontSizeHeight);
const fontSizeForHeight = (height: number) =>
  Math.max(
    initialFontSize,
    Math.min(
      finalFontSize,
      initialFontSize + (height - initialFontSizeHeight) * fontSizeGradient
    )
  );

const lineHeightGradient =
  (finalLineHeight - initialLineHeight) /
  (finalFontSizeHeight - initialFontSizeHeight);
const lineHeightForHeight = (height: number) =>
  Math.max(
    initialLineHeight,
    Math.min(
      finalLineHeight,
      initialLineHeight + (height - initialFontSizeHeight) * lineHeightGradient
    )
  );

const wrapperStyles = css(
  {
    width: '100%',
    maxWidth: '262px',
    height: 'unset',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '4px',
    padding: 10,

    border: `1px solid ${cssVar('borderDefault')}`,
    borderRadius: '16px',

    // Bottom side color bar. Inner shadow to avoid clipping selection.
    boxShadow: `inset 0 -${bottomBarSize}px 0 ${cssVar('borderDefault')}`,

    // Cursor
    cursor: 'default',

    // Conditional styles based on attributes
    '&[data-full-height="true"]': {
      height: '100%',
    },
    '&[data-max-width="false"]': {
      maxWidth: 'none',
    },
    '&[aria-selected="true"][aria-readonly="false"]': {
      backgroundColor: cssVar('backgroundDefault'),
      border: `1px solid ${cssVar('borderDefault')}`,
      boxShadow: `inset 0 -${bottomBarSize}px 0 ${cssVar('borderDefault')}`,
    },
    '&[aria-readonly="false"]:hover': {
      backgroundColor: cssVar('backgroundDefault'),
    },

    // Variables that can be consumed by children
    '--widget-hover': 0,
    '--widget-calculated-font-size': `${initialFontSize}px`,
    '--widget-calculated-line-height': `${initialLineHeight}px`,

    '&:hover': {
      '--widget-hover': 1,
    },
    '@media (hover: none)': {
      '--widget-hover': 1,
    },
  },
  hoverTransitionStyles('all')
);

type WidgetWrapperProps = {
  readonly children: ReactNode;
  readonly readOnly?: boolean;
  readonly selected?: boolean;
  readonly fullHeight?: boolean;
  readonly maxWidth?: boolean;
  readonly css?: SerializedStyles;
  readonly className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const WidgetWrapper = ({
  children,
  readOnly = false,
  selected = false,
  fullHeight = false,
  maxWidth = true,
  css: customCss,
  className,
  ...props
}: WidgetWrapperProps) => {
  // Resize observer
  const [height, setHeight] = useState(initialFontSizeHeight);
  const [resizeObserver] = useState(
    () =>
      new ResizeObserver(([entry]) => {
        if (entry) {
          setHeight(entry.borderBoxSize[0].blockSize);
        }
      })
  );
  const connectResizeObserver = useCallback(
    (el: HTMLElement | null) => {
      if (el) {
        resizeObserver.observe(el);
      } else {
        resizeObserver.disconnect();
      }
    },
    [resizeObserver]
  );

  return (
    <div
      ref={fullHeight ? connectResizeObserver : undefined}
      css={[
        customCss,
        wrapperStyles,
        {
          '--widget-calculated-font-size': `${fontSizeForHeight(height)}px`,
          '--widget-calculated-line-height': `${lineHeightForHeight(height)}px`,
        },
      ]}
      data-full-height={fullHeight}
      data-max-width={maxWidth}
      aria-selected={selected}
      aria-readonly={readOnly}
      className={className}
      data-testid="widget-editor"
      aria-roledescription="column-content"
      {...props}
    >
      {children}
    </div>
  );
};
