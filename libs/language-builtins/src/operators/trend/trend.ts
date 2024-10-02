import type { BuiltinSpec } from '../../types';
import { trendFunctor } from './trendFunctor';
import { trendValue } from './trendValue';

export const trend: BuiltinSpec = {
  argCount: 1,
  functorNoAutomap: trendFunctor,
  fnValuesNoAutomap: trendValue,
  explanation: 'analyze trends in a column. Can be used to compare tables.',
  syntax: 'trend(Column)',
  formulaGroup: 'Numbers',
};
