// eslint-disable-next-line no-restricted-imports
import type { Evaluator, Functor } from '../../interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';

export const concatColumnsFunctor: Functor = async ([col1, col2]) =>
  (await col1.isColumn()).sameAs(col2);

export const concatColumnsValues: Evaluator = async ([col1, col2]) =>
  Value.createConcatenatedColumn(
    Value.getColumnLike(col1),
    Value.getColumnLike(col2)
  );
