import { BuiltinSpec } from '../interfaces';
import { mathOperators } from './math-operators';
import { comparisonOperators } from './comparison-operators';
import { equalityOperators } from './equality-operators';
import { booleanOperators } from './boolean-operators';
import { listOperators } from './list-operators';
import { reducerOperators } from './reducer-operators';
import { tableOperators } from './table-operators';
import { tableGroupingOperators } from './table-grouping-operators';
import { miscOperators } from './misc-operators';
import { contractOperators } from './contract-operators';
import { trignometricOperators } from './trignometric-operators';
import { compoundOperators } from './compound-operators';
import { enrichOperators } from './enrichOperators';
import { roundOperators } from './round-operators';
import { dateOperators } from './date-operators';

export const operators: { [fname: string]: BuiltinSpec } = enrichOperators({
  ...mathOperators,
  ...comparisonOperators,
  ...equalityOperators,
  ...booleanOperators,
  ...listOperators,
  ...reducerOperators,
  ...tableOperators,
  ...tableGroupingOperators,
  ...miscOperators,
  ...contractOperators,
  ...trignometricOperators,
  ...compoundOperators,
  ...roundOperators,
  ...dateOperators,
});
