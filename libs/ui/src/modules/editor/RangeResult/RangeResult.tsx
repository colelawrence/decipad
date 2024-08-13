import { FC } from 'react';
import { CodeResult } from '..';
import { CodeResultProps } from '../../../types';

export const RangeResult = ({
  type: { rangeOf },
  value,
  meta,
  variant,
  element,
}: CodeResultProps<'range'>): ReturnType<FC> => {
  if (!rangeOf) {
    return null;
  }

  return (
    <span data-highlight-changes>
      <CodeResult
        type={rangeOf}
        value={value[0]}
        meta={meta}
        variant={variant}
        element={element}
      />{' '}
      &rarr;{' '}
      <CodeResult
        type={rangeOf}
        value={value[1]}
        meta={meta}
        variant={variant}
        element={element}
      />
    </span>
  );
};
