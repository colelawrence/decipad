// eslint-disable-next-line no-restricted-imports
import { Type } from '@decipad/language-types';
import type { BuiltinSpec } from '../../interfaces';
import { concatTablesFunctor, concatTablesValues } from './concat-tables';
import { concatColumnsFunctor, concatColumnsValues } from './concat-columns';

export const concat: BuiltinSpec = {
  argCount: 2,
  functorNoAutomap: async (...args) =>
    Type.either(concatTablesFunctor(...args), concatColumnsFunctor(...args)),
  fnValuesNoAutomap: async (...args) => {
    const [, [arg1Type, arg2Type]] = args;
    if (
      !(await arg1Type.isTable()).errorCause &&
      !(await arg2Type.isTable()).errorCause
    ) {
      return concatTablesValues(...args);
    }
    return concatColumnsValues(...args);
  },
  explanation: 'Joins two tables or columns into one.',
  syntax: 'cat(Table1.Col1, Table2.Col2)',
  example: 'cat(Day1.Sales, Day2.Sales)',
  formulaGroup: 'Tables or Columns',
};
