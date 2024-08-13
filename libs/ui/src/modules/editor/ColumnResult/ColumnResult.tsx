import { FC, useCallback, useEffect, useState } from 'react';
import { concatMap } from 'rxjs';
import { CodeResultProps } from '../../../types';
import { LabeledColumnResult } from './LabeledColumnResult';
import { SimpleColumnResult } from './SimpleColumnResult';
import { useComputer } from '@decipad/editor-hooks';
import { DimensionExplanation } from '@decipad/computer-interfaces';
import { dequal } from '@decipad/utils';

export const ColumnResult: FC<
  CodeResultProps<'materialized-column'> | CodeResultProps<'column'>
> = ({ element, ...result }) => {
  const computer = useComputer();
  const [labels, setLabels] = useState<DimensionExplanation[] | undefined>(
    undefined
  );

  const setLabelsSafe = useCallback(
    (newLabels: DimensionExplanation[] | undefined) => {
      if (newLabels && !dequal(newLabels, labels)) {
        setLabels(newLabels);
      }
    },
    [labels]
  );

  useEffect(() => {
    const sub = computer.explainDimensions$
      .observe(result)
      .pipe(concatMap(async (explanation) => explanation))
      .subscribe(setLabelsSafe);
    return () => sub.unsubscribe();
  }, [computer.explainDimensions$, result, setLabelsSafe]);

  return labels ? (
    <LabeledColumnResult labels={labels} element={element} {...result} />
  ) : (
    <SimpleColumnResult element={element} {...result} />
  );
};
