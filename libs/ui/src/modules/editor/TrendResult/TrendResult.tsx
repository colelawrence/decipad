/* eslint decipad/css-prop-named-variable: 0 */
import { FC, useMemo } from 'react';
import { css } from '@emotion/react';
import { formatResult } from '@decipad/format';
import { CodeResult } from '..';
import { CodeResultProps } from '../../../types';
import { N, ZERO } from '@decipad/number';
import {
  componentCssVars,
  cssVar,
  p13Bold,
  p8Regular,
} from 'libs/ui/src/primitives';
import { Tooltip } from '../../../shared/atoms';

const ONE_HUNDRED = N(100);

const arrowStyles = css(p13Bold);

const percentageStyles = css(p8Regular, {
  color: cssVar('textSubdued'),
});

const TrendIndicator = ({
  type: { trendOf },
  value: { diff = ZERO, first = ZERO, last = ZERO },
}: CodeResultProps<'trend'>) => {
  const positive = useMemo(() => diff.compare(ZERO) > 0, [diff]);
  const percentage = useMemo(
    () => diff.div(first).abs().mul(ONE_HUNDRED).round(0),
    [diff, first]
  );

  if (diff.isZero()) {
    return <>&mdash;</>;
  }

  const trendColor = componentCssVars(
    positive ? 'TrendUpGreenColor' : 'TrendDownRedColor'
  );

  const arrow = positive ? '\u2191' : '\u2193';

  const result = (
    <span data-highlight-changes>
      <span css={[arrowStyles, { color: trendColor }]}>{arrow}</span>
      <span css={percentageStyles}>{percentage.toString()}%</span>
    </span>
  );

  const tooltipContent = (
    <span>
      {formatResult('en-US', first, trendOf)} &rarr;{' '}
      {formatResult('en-US', last, trendOf)}
    </span>
  );

  return (
    <Tooltip trigger={result} stopClickPropagation>
      {tooltipContent}
    </Tooltip>
  );
};

export const TrendResult = (
  props: CodeResultProps<'trend'>
): ReturnType<FC> => {
  const {
    type: { trendOf },
    value,
    meta,
    variant,
    element,
  } = props;
  const { last } = value;
  return (
    <div>
      <CodeResult
        type={trendOf}
        value={last}
        meta={meta}
        variant={variant}
        element={element}
      />{' '}
      <TrendIndicator {...props} />
    </div>
  );
};
