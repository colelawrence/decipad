/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode, useCallback, useState } from 'react';
import { useSelected } from 'slate-react';
import {
  componentCssVars,
  cssVar,
  p13Medium,
  p14Medium,
  shortAnimationDuration,
} from '../../../primitives';
import { AvailableSwatchColor } from '../../../utils';
import { ArrowUp2 } from 'libs/ui/src/icons';

const bottomBarSize = 2;

const initialFontSize = 24;
const initialFontSizeHeight = 110;
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

const wrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: 16,

  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '16px',

  // Bottom side color bar.
  boxShadow: `0px ${bottomBarSize}px ${cssVar('borderSubdued')}`,
  marginBottom: `${bottomBarSize}px`,
});

const selectedStyles = css({ backgroundColor: cssVar('backgroundAccent') });

const captionStyles = css([
  p13Medium,
  {
    marginBottom: 8,
  },
]);

const valueStyles = (height: number) =>
  css({
    color: cssVar('textHeavy'),
    fontWeight: 500, // Medium
    fontSize: `${fontSizeForHeight(height)}px`,
    lineHeight: `${lineHeightForHeight(height)}px`,
    transitionProperty: 'font-size, line-height',
    transitionDuration: shortAnimationDuration,
  });

const comparisonStyles = css([
  p14Medium,
  {
    color: cssVar('textHeavy'),
    display: 'flex',
  },
]);

const hiddenChildrenStyles = css({
  display: 'none',
});

interface MetricProps {
  children?: ReactNode;
  // TODO: Do something with color
  color?: AvailableSwatchColor;
  fullHeight?: boolean;
}

export const Metric = ({
  children,
  fullHeight,
}: MetricProps): ReturnType<FC> => {
  const selected = useSelected();

  // In full height mode, scale font size and line height with widget height
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

  const trendColor = componentCssVars('TrendUpGreenColor');

  return (
    <div
      ref={fullHeight ? connectResizeObserver : undefined}
      aria-roledescription="column-content"
      css={[
        wrapperStyles,
        selected && selectedStyles,
        fullHeight && { height: '100%' },
      ]}
    >
      <div css={captionStyles}>Revenue per pet</div>
      <div>
        <div css={valueStyles(fullHeight ? height : 0)}>7.64</div>
        <div css={comparisonStyles}>
          <span css={{ color: trendColor, width: 16, height: 16 }}>
            <ArrowUp2 />
          </span>
          <span css={{ color: trendColor }}>6%</span> vs last week
        </div>
      </div>

      <div css={hiddenChildrenStyles}>{children}</div>
    </div>
  );
};
