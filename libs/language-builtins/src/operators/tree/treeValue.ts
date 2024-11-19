// eslint-disable-next-line no-restricted-imports
import {
  buildResult,
  buildType,
  materializeOneResult,
  serializeType,
  type Type,
  Value,
} from '@decipad/language-types';
import { getInstanceof } from '@decipad/utils';
import type { Result, SerializedType } from '@decipad/language-interfaces';
import { Unknown } from '@decipad/language-interfaces';
import type { AggregationIds } from '@decipad/language-aggregations';
import { type FullBuiltinSpec, type BuiltinContextUtils } from '../../types';
import {
  deserializeResult,
  serializeResult,
  buildTree,
} from '@decipad/compute-backend-js';
import { fromNumber } from '@decipad/number';
import { applyTableFunctions } from './applyTableFunctions';
import { applyTableFilters } from './applyTableFilters';
import { DeserializeResultArg } from 'libs/compute-backend-js/src/serializableResult';

const makeTreeValue = async (
  ctx: BuiltinContextUtils,
  _root: Result.OneResult,
  _rootAggregation: Result.Result | undefined,
  table: Value.Table,
  tableType: Type,
  filters: Type | undefined,
  roundings: Type | undefined,
  aggregations?: Value.Table
): Promise<Value.Tree> => {
  const aggValues =
    aggregations &&
    ((await materializeOneResult(
      aggregations.getData()
    )) as Result.ResultMaterializedTable);

  const aggTable: Record<string, AggregationIds> = {};
  if (aggValues) {
    let i = 0;
    for (const col of aggregations.columnNames) {
      aggTable[col] = aggValues[i][0] as AggregationIds;
      i++;
    }
  }

  const aggs = table.columnNames.map((col) => aggTable[col]);

  table = filters ? await applyTableFilters(ctx, table, filters) : table;
  table = roundings ? await applyTableFunctions(ctx, table, roundings) : table;
  const tableData = await table.getData();
  const realTableType =
    tableType || buildType.table({ columnTypes: [], columnNames: [] });
  const wasmTree = buildTree(
    await serializeResult(buildResult(serializeType(realTableType), tableData)),
    {
      aggregations: aggs,
    }
  );
  const tree = deserializeResult(wasmTree as DeserializeResultArg);
  if (tree.type.kind !== 'tree') throw new Error('return type is not tree');
  const newTree = unitFixup(
    realTableType,
    aggs,
    tree.value as Result.ResultTree
  );
  return newTree;
};
const unitHacks: {
  [id in AggregationIds]?:
    | SerializedType
    | ((colType?: Type) => SerializedType)
    | undefined;
} = {
  'date:span': (col) => ({
    kind: 'number',
    unit: [
      {
        unit: col?.date ?? 'day',
        known: true,
        exp: fromNumber(1, 1),
        multiplier: fromNumber(1, 1),
      },
    ],
  }),
  'boolean:percent-true': {
    kind: 'number',
    numberFormat: 'percentage',
  },
  'boolean:percent-false': {
    kind: 'number',
    numberFormat: 'percentage',
  },
  'number:percent-of-total': {
    kind: 'number',
    numberFormat: 'percentage',
  },
};

const resolveUnitHack = (aggId: AggregationIds, colType?: Type) => {
  const ty = unitHacks[aggId];
  if (typeof ty === 'function') return ty(colType);
  return ty;
};
/**
 * Incredibly hacky recursive traversal to fix units/number formats for aggregations we know have specific types (e.g date span + % of x)
 * TODO: remove me once we have unit/numberFormat support in WASM
 */
const unitFixup = (
  table: Type,
  aggs: AggregationIds[],
  node: Value.Tree,
  height = -1
): Value.Tree => {
  if (height >= 0) {
    const rootType =
      aggs[height] &&
      resolveUnitHack(aggs[height], table.columnTypes?.[height]);
    if (rootType && node.rootAggregation) node.rootAggregation.type = rootType;
  }
  for (let i = 0; i < node.columns.length; i++) {
    const agg = aggs[height + i + 1];
    const unit =
      agg && resolveUnitHack(agg, table.columnTypes?.[height + i + 1]);
    const col = node.columns[i];
    if (unit && !!col.aggregation) {
      col.aggregation.type = unit;
    }
    node.columns[i] = col;
  }

  for (let i = 0; i < node.children.length; i++) {
    node.children[i] = unitFixup(table, aggs, node.children[i], height + 1);
  }
  return node;
};

export const treeValue: FullBuiltinSpec['fnValuesNoAutomap'] = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [table, _f, _r, aggregations],
  [tableType, filters, roundings],
  ctx
) => {
  const treeValue = await makeTreeValue(
    ctx,
    Unknown,
    undefined,
    getInstanceof(table, Value.Table),
    tableType,
    filters,
    roundings,
    aggregations && getInstanceof(aggregations, Value.Table)
  );

  return treeValue;
};
