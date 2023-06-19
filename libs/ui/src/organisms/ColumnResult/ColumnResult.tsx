import { FC, useMemo } from 'react';
import { useComputer } from '@decipad/react-contexts';
import { useObservable } from 'rxjs-hooks';
import { concatMap, distinctUntilChanged } from 'rxjs';
import { dequal } from '@decipad/utils';
import { CodeResultProps } from '../../types';
import { LabeledColumnResult } from './LabeledColumnResult';
import { SimpleColumnResult } from './SimpleColumnResult';

export const ColumnResult = ({
  type,
  value,
  element,
}: CodeResultProps<'materialized-column'>): ReturnType<FC> => {
  const computer = useComputer();

  const result = useMemo(() => ({ type, value }), [type, value]);

  const labels = useObservable(() =>
    computer.explainDimensions$.observe(result).pipe(
      concatMap((p) => p),
      distinctUntilChanged((a, b) => dequal(a, b))
    )
  );

  return labels ? (
    <LabeledColumnResult
      labels={labels}
      type={type}
      value={value}
      element={element}
    />
  ) : (
    <SimpleColumnResult type={type} value={value} element={element} />
  );
};
