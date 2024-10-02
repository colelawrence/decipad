import { FC } from 'react';
import { CodeResult } from '..';
import { CodeResultProps } from '../../../types';
import { ZERO } from '@decipad/number';
import { css } from '@emotion/react';

const negativeIndicator = css({
  color: 'red',
});

const positiveIndicator = css({
  color: 'green',
});

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
  const compare = diff.compare(ZERO);

  return (
    <span data-highlight-changes>
      {compare > 0 ? (
        <span css={positiveIndicator}>&uarr;</span>
      ) : (
        <span css={negativeIndicator}>&darr;</span>
      )}
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
