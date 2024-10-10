/* eslint decipad/css-prop-named-variable: 0 */
import { FC } from 'react';
import { CodeResult } from '..';
import { CodeResultProps } from '../../../types';
import { ZERO } from '@decipad/number';
import { componentCssVars } from 'libs/ui/src/primitives';

const TrendIndicator = ({
  type: { trendOf },
  value: { diff },
}: CodeResultProps<'trend'>) => {
  if (trendOf.kind !== 'number' || diff == null) {
    return null;
  }

  if (diff.isZero()) {
    return <>&mdash;</>;
  }

  const positive = diff.compare(ZERO) > 0;

  const trendColor = componentCssVars(
    positive ? 'TrendUpGreenColor' : 'TrendDownRedColor'
  );

  const arrow = positive ? '\u2191' : '\u2193';

  return (
    <span data-highlight-changes>
      <span css={{ color: trendColor }}>{arrow}</span>
    </span>
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
  const { first, last } = value;
  return (
    <div>
      <CodeResult
        type={trendOf}
        value={first}
        meta={meta}
        variant={variant}
        element={element}
      />{' '}
      &rarr;{' '}
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
