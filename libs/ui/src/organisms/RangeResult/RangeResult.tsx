import { FC } from 'react';
import { CodeResult } from '..';
import { CodeResultProps } from '../../types';

export const RangeResult = ({
  type: { rangeOf },
  value,
  variant,
}: CodeResultProps<'range'>): ReturnType<FC> => {
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
