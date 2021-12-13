import { BuiltinSpec } from '../interfaces';
import { mathOperators } from './math-operators';
import { comparisonOperators } from './comparison-operators';
import { booleanOperators } from './boolean-operators';
import { listOperators } from './list-operators';
import { reducerOperators } from './reducer-operators';
import { dateOperators } from './date-operators';
import { tableOperators } from './table-operators';
import { miscOperators } from './misc-operators';

export const operators: { [fname: string]: BuiltinSpec } = {
  ...mathOperators,
  ...comparisonOperators,
  ...booleanOperators,
  ...listOperators,
  ...reducerOperators,
  ...dateOperators,
  ...tableOperators,
  ...miscOperators,
};
