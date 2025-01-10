/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
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
import { WidgetWrapper } from '../WidgetWrapper/WidgetWrapper';
import { OpaqueColor } from '@decipad/utils';

const headerStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  minHeight: '24px',
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
  height: '24px',
  width: '24px',
  flexShrink: 0,
  padding: '4px',
  ':hover': {
    backgroundColor: cssVar('backgroundHeavy'),
    borderRadius: '4px',
  },
  // Always visible on devices that cannot hover
  '@media (hover: hover)': {
    opacity: 'var(--widget-hover)',
    transition: `opacity ${shortAnimationDuration}`,
  },
});

const valueStyles = css({
  fontWeight: 500, // Medium
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  transitionProperty: 'font-size, line-height',
  transitionDuration: shortAnimationDuration,
  fontSize: 'var(--widget-calculated-font-size)',
  lineHeight: 'var(--widget-calculated-line-height)',
});

const comparisonStyles = css([
  p14Medium,
  {
    display: 'flex',
  },
]);

const hiddenChildrenStyles = css({
  display: 'none',
});

const widgetWrapperOverrideStyles = css({
  padding: '10px 10px 16px 16px',
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
  readonly trendColor?: AvailableSwatchColor | 'trend';
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
  trendColor: trendColorProp = 'trend',
  maxWidth = true,
  fullHeight = false,
  onClickEdit,
}: MetricProps): ReturnType<FC> => {
  const color = useSwatchColor(colorProp, 'vivid', 'base');
  const trendColor = useSwatchColor<'trend'>(trendColorProp, 'vivid', 'base');
  const selected = useSelected();

  return (
    <WidgetWrapper
      fullHeight={fullHeight}
      maxWidth={maxWidth}
      selected={selected}
      readOnly={readOnly}
      css={widgetWrapperOverrideStyles}
    >
      <div css={headerStyles}>
        <div css={captionStyles}>{caption || '\u00a0'}</div>
        {!readOnly && onClickEdit && (
          <button type="button" css={formatButtonStyles} onClick={onClickEdit}>
            <Settings2 />
          </button>
        )}
      </div>

      <div css={[valueStyles, { color: color.hex }]}>
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
          color={trendColor}
        />
      )}

      <div css={hiddenChildrenStyles}>{children}</div>
    </WidgetWrapper>
  );
};

interface MetricComparisonProps {
  readonly trendResult: Result.Result<'trend'>;
  readonly comparisonDescription?: string;
  readonly color: OpaqueColor | 'trend';
}

const MetricComparison = ({
  trendResult,
  comparisonDescription,
  color: colorProp,
}: MetricComparisonProps) => {
  const { first, diff } = trendResult.value;
  if (!first || !diff) return null;

  const percentageChange = diff.abs().div(first).mul(N(100)).round().toString();
  const zero = diff.isZero();
  const positive = diff.compare(ZERO) > 0;

  const color = (() => {
    if (colorProp !== 'trend') return colorProp.hex;
    if (zero) return cssVar('textSubdued');
    return componentCssVars(
      positive ? 'TrendUpGreenColor' : 'TrendDownRedColor'
    );
  })();

  const Icon = positive ? ArrowUp2 : ArrowDown2;

  return (
    <div css={comparisonStyles}>
      {!zero && (
        <span css={{ color, width: 16, height: 16 }}>
          <Icon />
        </span>
      )}
      <span css={{ color }}>{percentageChange}%</span>
      {comparisonDescription && ` ${comparisonDescription.trim()}`}
    </div>
  );
};
