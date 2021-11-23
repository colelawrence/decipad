import { FC } from 'react';
import { ResultTypeProps } from '../../lib/results';
import { CodeResult } from '..';

export const RangeResult = ({
  type: { rangeOf },
  value,
  variant,
}: ResultTypeProps): ReturnType<FC> => {
  if (!rangeOf) {
    return null;
  }

  return (
    <span>
      <CodeResult type={rangeOf} value={value[0]} variant={variant} /> &rarr;{' '}
      <CodeResult type={rangeOf} value={value[1]} variant={variant} />
    </span>
  );
};
