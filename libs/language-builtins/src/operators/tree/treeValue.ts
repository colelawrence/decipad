// eslint-disable-next-line no-restricted-imports
import { type Type, Value } from '@decipad/language-types';
import { getInstanceof } from '@decipad/utils';
import type { Result } from '@decipad/language-interfaces';
import { Unknown } from '@decipad/language-interfaces';
import { type FullBuiltinSpec, type BuiltinContextUtils } from '../../types';
import { applyTableFilters } from './applyTableFilters';
import { applyTableFunctions } from './applyTableFunctions';
import { makeRecursiveTreeValue } from './makeRecursiveTreeValue';

const makeTreeValue = async (
  ctx: BuiltinContextUtils,
  root: Result.OneResult,
  rootAggregation: Result.Result | undefined,
  _table: Value.Table,
  tableType: Type,
  filters: Type | undefined,
  roundings: Type | undefined,
  aggregations?: Type
): Promise<Value.Tree> => {
  let table = filters ? await applyTableFilters(ctx, _table, filters) : _table;
  table = roundings ? await applyTableFunctions(ctx, table, roundings) : table;
  return makeRecursiveTreeValue(
    table,
    root,
    rootAggregation,
    1,
    table,
    tableType,
    aggregations,
    ctx
  );
};

export const treeValue: FullBuiltinSpec['fnValuesNoAutomap'] = async (
  [table],
  [tableType, filters, roundings, aggregations],
  ctx
) => {
  return makeTreeValue(
    ctx,
    Unknown,
    undefined,
    getInstanceof(table, Value.Table),
    tableType,
    filters,
    roundings,
    aggregations
  );
};
