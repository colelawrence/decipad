// eslint-disable-next-line no-restricted-imports
import { produce } from '@decipad/utils';
import type { Evaluator, Functor } from '../../types';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';

export const concatColumnsFunctor: Functor = async ([col1, col2]) =>
  (await (await col1.isColumn()).sameAs(col2)).mapType((col1) =>
    produce(col1, (col1) => {
      col1.cellCount =
        col1.cellCount != null && col2.cellCount != null
          ? col1.cellCount + col2.cellCount
          : undefined;
      return col1;
    })
  );

export const concatColumnsValues: Evaluator = async ([col1, col2]) =>
  Value.createConcatenatedColumn(
    Value.getColumnLike(col1),
    Value.getColumnLike(col2)
  );
