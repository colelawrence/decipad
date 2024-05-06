import { FC } from 'react';
import { concatMap, distinctUntilChanged } from 'rxjs';
import { useObservable } from 'rxjs-hooks';
import { useComputer } from '@decipad/react-contexts';
import { dequal } from '@decipad/utils';
import { CodeResultProps } from '../../../types';
import { LabeledColumnResult } from './LabeledColumnResult';
import { SimpleColumnResult } from './SimpleColumnResult';

export const ColumnResult: FC<
  CodeResultProps<'materialized-column'> | CodeResultProps<'column'>
> = ({ element, ...result }) => {
  const computer = useComputer();

  const labels = useObservable(() =>
    computer.explainDimensions$.observe(result).pipe(
      concatMap((p) => p),
      distinctUntilChanged((a, b) => dequal(a, b))
    )
  );

  return labels ? (
    <LabeledColumnResult labels={labels} element={element} {...result} />
  ) : (
    <SimpleColumnResult element={element} {...result} />
  );
};
