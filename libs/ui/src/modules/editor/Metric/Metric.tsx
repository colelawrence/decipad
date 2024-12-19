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
import { AvailableSwatchColor, useSwatchColor } from '../../../utils';
import { ArrowUp2, ArrowDown2, Settings2 } from 'libs/ui/src/icons';
import { ResultType } from '@decipad/computer-interfaces';
import { CodeResult } from '../CodeResult/CodeResult';
import { Result } from '@decipad/language-interfaces';
import { N, ZERO } from '@decipad/number';
import { NumberFormatting } from '@decipad/editor-types';

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

  '--metric-hover': 0,

  '&:hover': {
    '--metric-hover': 1,
  },
});

const selectedStyles = css({ backgroundColor: cssVar('backgroundAccent') });

const headerStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginBottom: '8px',
});

const captionStyles = css([
  p13Medium,
  {
    flexGrow: 1,
  },
]);

const formatButtonStyles = css({
  display: 'grid',
  alignItems: 'start',
  height: '20px',
  width: '20px',
  flexShrink: 0,
  padding: '2px',
  ':hover': {
    backgroundColor: cssVar('backgroundHeavy'),
    borderRadius: '50%',
  },
  // Always visible on devices that cannot hover
  '@media (hover: hover)': {
    opacity: 'var(--metric-hover)',
    transition: `opacity ${shortAnimationDuration}`,
  },
});

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

export interface MetricProps {
  readonly children?: ReactNode;
  readonly readOnly?: boolean;
  readonly caption: string;
  readonly mainResult?: ResultType;
  readonly trendResult?: ResultType;
  readonly comparisonDescription?: string;
  readonly formatting?: NumberFormatting;
  readonly color?: AvailableSwatchColor;
  readonly maxWidth?: boolean;
  readonly fullHeight?: boolean;
  readonly onClickEdit?: () => void;
}

export const Metric = ({
  children,
  readOnly = false,
  caption,
  mainResult,
  trendResult,
  comparisonDescription,
  formatting,
  color: colorProp = 'Catskill',
  maxWidth = true,
  fullHeight = false,
  onClickEdit,
}: MetricProps): ReturnType<FC> => {
  const selected = useSelected();
  const color = useSwatchColor(colorProp, 'vivid', 'base');

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

  return (
    <div
      ref={fullHeight ? connectResizeObserver : undefined}
      aria-roledescription="column-content"
      css={[
        wrapperStyles,
        selected && selectedStyles,
        maxWidth && { maxWidth: '262px' },
        fullHeight && { height: '100%' },
      ]}
    >
      <div css={headerStyles}>
        <div css={captionStyles}>{caption || '\u00a0'}</div>
        {!readOnly && onClickEdit && (
          <button type="button" css={formatButtonStyles} onClick={onClickEdit}>
            <Settings2 />
          </button>
        )}
      </div>
      <div>
        <div css={[valueStyles(fullHeight ? height : 0), { color: color.hex }]}>
          {mainResult?.type.kind !== 'type-error' && mainResult ? (
            <CodeResult {...mainResult} formatting={formatting} />
          ) : (
            '0'
          )}
        </div>
        {/* TODO: Handle case error case */}
        {trendResult?.type.kind === 'trend' && (
          <MetricComparison
            trendResult={trendResult as any}
            comparisonDescription={comparisonDescription}
          />
        )}
      </div>

      <div css={hiddenChildrenStyles}>{children}</div>
    </div>
  );
};

interface MetricComparisonProps {
  readonly trendResult: Result.Result<'trend'>;
  readonly comparisonDescription?: string;
}

const MetricComparison = ({
  trendResult,
  comparisonDescription,
}: MetricComparisonProps) => {
  const { first, diff } = trendResult.value;
  if (!first || !diff) return null;

  const percentageChange = diff.abs().div(first).mul(N(100)).round().toString();
  const zero = diff.isZero();
  const positive = diff.compare(ZERO) > 0;

  const trendColor = zero
    ? cssVar('textSubdued')
    : componentCssVars(positive ? 'TrendUpGreenColor' : 'TrendDownRedColor');

  const Icon = positive ? ArrowUp2 : ArrowDown2;

  return (
    <div css={comparisonStyles}>
      {!zero && (
        <span css={{ color: trendColor, width: 16, height: 16 }}>
          <Icon />
        </span>
      )}
      <span css={{ color: trendColor }}>{percentageChange}%</span>
      {comparisonDescription && ` ${comparisonDescription.trim()}`}
    </div>
  );
};
