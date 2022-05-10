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

export const operators: { [fname: string]: BuiltinSpec } = {
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
};
