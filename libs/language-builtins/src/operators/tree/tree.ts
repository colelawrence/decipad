import type { FullBuiltinSpec } from '../../interfaces';
import { treeFunctor } from './treeFunctor';
import { treeValue } from './treeValue';

// The tree function is used to make a sorted and aggregated tree out of a table.
// It's nor available in the user function catalog and is used internally by the system.
// It's dependent on the 4 arguments: SourceTable, Filters, Aggregations, and Roundings.
// These are all tables and typically have been constructed by the translation of a data view into a table.
// Filters is a table that contains a column for each column in the source table, and each row contains a filter lambda function for that column.
// Aggregations is a table that contains a column for each column in the source table, and each row contains an aggregation lambda function for that column.
// Roundings is a table that contains a column for each column in the source table, and each row contains a rounding lambda function for that column.
// These get applied in the following order: filters, roundings and then aggregations.

export const tree: FullBuiltinSpec = {
  argCount: [1, 2, 3, 4],
  functorNoAutomap: treeFunctor,
  fnValuesNoAutomap: treeValue,
  explanation: 'make a sorted and aggregated tree out of a table.',
  hidden: true,
  syntax: 'tree(Table, FiltersTable, AggregationsTable, RoundingsTable)',
  formulaGroup: 'Tables',
  example: 'tree(SalesTable, FiltersTable, AggregationsTable, RoundingsTable)',
};
