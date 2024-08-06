import type { BuiltinSpec } from '../../types';
import { tree } from '../tree';
import { lookupFunctorNoAutomap, lookupValuesNoAutomap } from './lookup';
import { sortByFunctorNoAutomap, sortyByValuesNoAutomap } from './sortby';
import { filterFunctorNoAutomap, filterValuesNoAutomap } from './filter';
import { joinFunctorNoAutomap, joinValuesNoAutomap } from './join';

export const tableOperators: { [fname: string]: BuiltinSpec } = {
  lookup: {
    argCount: [2, 3],
    functorNoAutomap: lookupFunctorNoAutomap,
    fnValuesNoAutomap: lookupValuesNoAutomap,
    explanation: 'Lookup first row that matches a condition.',
    formulaGroup: 'Tables',
    syntax: 'lookup(Table, Column Condition, [Default Value])',
    example: 'lookup(Prices, Prices.Discount == 10%, 0)',
  },

  sortby: {
    argCount: 2,
    argCardinalities: [[1, 2]],
    functor: sortByFunctorNoAutomap,
    fnValues: sortyByValuesNoAutomap,
    explanation: 'Reorder table rows based on a column.',
    syntax: 'sortby(Table, Table.Column)',
    formulaGroup: 'Tables',
    example: 'sortby(Prices, Prices.Discount)',
  },

  filter: {
    argCount: 2,
    functorNoAutomap: filterFunctorNoAutomap,
    fnValuesNoAutomap: filterValuesNoAutomap,
    explanation: 'Filter table rows based on column values.',
    syntax: 'filter(Table, Column Condition)',
    formulaGroup: 'Tables',
    example: 'filter(Prices, Prices.Discount > 20%)',
  },
  grab: {
    aliasFor: 'filter',
    explanation: 'Filter table rows based on column values.',
    syntax: 'grab(Table, Column Condition)',
    formulaGroup: 'Tables',
    example: 'grab(Prices, Prices.Discount > 20%)',
  },
  tree,
  join: {
    argCount: 1,
    functorNoAutomap: joinFunctorNoAutomap,
    fnValuesNoAutomap: joinValuesNoAutomap,
    explanation: 'Joins tables by specifying the column to join on.',
    syntax: 'join(Column Condition)',
    formulaGroup: 'Tables',
    example: 'join(Employees.DepartmentID == Departments.ID)',
  },
};
