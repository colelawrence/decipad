/* eslint-disable no-restricted-imports */
import { ComputationRealm } from '../computer/ComputationRealm';
import {
  AST,
  Type,
  Value as TValue,
  Result,
  Unknown,
} from '@decipad/language-interfaces';
import { getDefined, once } from '@decipad/utils';
import stringify from 'json-stringify-safe';
import {
  getResultGenerator,
  buildType as t,
  Value,
} from '@decipad/language-types';
import { tableValueToTableResultValue, Time } from '@decipad/language';
import { enrichComputeResultWithMeta } from './enrichComputeResultWithMeta';
import { getTableValue } from 'libs/language-types/src/Value';
import { TStackFrame } from '../../../language/src/scopedRealm/stack';
import { all, map } from '@decipad/generator-utils';

export type MassageResults = [
  type: Type,
  value: TValue.Value,
  data: Result.OneResult
];

const massageTableComputeResult = (
  realm: ComputationRealm,
  variableName: string,
  table: AST.Table
): MassageResults => {
  let type = getDefined(realm.inferContext.stack.get(getDefined(variableName)));
  let value = realm.interpreterRealm.stack.get(getDefined(variableName));
  if (type.columnNames?.length !== type.columnTypes?.length) {
    return [
      t.impossible("column names and column types don't match length", table),
      Value.UnknownValue,
      Unknown,
    ];
  }

  if (!value || !Value.isTableValue(value)) {
    throw new Error(
      `table does not have table value: ${value}, ${stringify(
        value
      )} (${typeof value})`
    );
  }

  [type, value] = Value.sortValue(type, value);

  if (!value || !Value.isTableValue(value)) {
    throw new Error(
      `table does not have table value: ${value}, ${stringify(
        value
      )} (${typeof value})`
    );
  }
  if (
    value &&
    Array.isArray(value.columns) &&
    value.columns.length !== type.columnNames?.length
  ) {
    return [
      t.impossible(
        "column names and result column count don't match length",
        table
      ),
      Value.UnknownValue,
      Unknown,
    ];
  }

  value = enrichComputeResultWithMeta(value);

  return [type, value, tableValueToTableResultValue(getTableValue(value))];
};

const emptyMeta = {
  labels: undefined,
};

const massageColumnComputeResult = (
  valueStack: TStackFrame<TValue.Value>,
  typeStack: TStackFrame<Type>,
  type: Type,
  value: TValue.Value,
  data: Result.OneResult
): MassageResults => {
  let { indexedBy } = type;

  if (!indexedBy) {
    return [type, value, data];
  }
  if (!Value.isColumnLike(value)) {
    throw new Error(
      `column does not have column value: ${value}, ${stringify(
        value
      )} (${typeof value})`
    );
  }
  const previousMeta = value.meta?.bind(value);
  // eslint-disable-next-line complexity
  const newMeta = once((): Result.ResultMetadataColumn | undefined => {
    const meta = previousMeta?.();
    if (meta?.labels) {
      return meta;
    }

    let indexerValue: TValue.Value | null | undefined;
    let indexerType: Type | null | undefined;
    while (!indexerValue && indexedBy) {
      indexerType = typeStack.get(indexedBy);
      if (!indexerType) {
        break;
      }
      const previousIndexedBy = indexedBy;
      if (
        indexerType.delegatesIndexTo &&
        previousIndexedBy !== indexerType.delegatesIndexTo
      ) {
        indexedBy = indexerType.delegatesIndexTo;
        continue;
      }
      if (
        indexerType.indexedBy &&
        previousIndexedBy !== indexerType.indexedBy
      ) {
        indexedBy = indexerType.indexedBy;
        continue;
      }
      indexerValue = valueStack.get(indexedBy);
      if (!indexerValue) {
        break;
      }
    }
    if (!indexerType || !indexerValue) {
      return meta ?? emptyMeta;
    }
    if (
      !Value.isTableValue(indexerValue) &&
      !Value.isColumnLike(indexerValue)
    ) {
      return meta ?? emptyMeta;
    }
    if (Value.isTableValue(indexerValue)) {
      indexerType = indexerType?.columnTypes?.[0];
      if (!indexerType) {
        return meta ?? emptyMeta;
      }
      [indexerValue] = indexerValue.columns;
    }
    if (!Value.isColumnLike(indexerValue)) {
      return meta ?? emptyMeta;
    }
    const columnMeta = indexerValue.meta?.();
    if (columnMeta?.labels) {
      return columnMeta;
    }
    {
      if (indexerType.type === 'string' || indexerType.type === 'number') {
        // this is causing big performance problems.
        return {
          labels: indexerValue
            .getData()
            .then(async (data) =>
              Promise.all([all(map(getResultGenerator(data)(), String))])
            ),
        };
      }

      const { date } = getDefined(type.cellType);
      if (date) {
        return {
          labels: indexerValue
            .getData()
            .then(async (data) =>
              Promise.all([
                all(
                  map(getResultGenerator(data)(), (d) =>
                    Time.stringifyDate(
                      d as bigint | number | symbol | undefined,
                      date
                    )
                  )
                ),
              ])
            ),
        };
      }
    }
    return meta;
  });
  value.meta = newMeta;

  return [type, value, data];
};

export const massageComputeResult = (
  realm: ComputationRealm,
  valueStack: TStackFrame<TValue.Value>,
  typeStack: TStackFrame<Type>,
  type: Type,
  variableName: string | undefined,
  statement: AST.Statement,
  value: TValue.Value,
  data: Result.OneResult
): MassageResults => {
  if (type.errorCause) {
    return [type, Value.UnknownValue, Unknown];
  }
  if (statement.type === 'table' && variableName) {
    return massageTableComputeResult(realm, variableName, statement);
  }
  if (type.cellType) {
    // column
    return massageColumnComputeResult(valueStack, typeStack, type, value, data);
  }
  return [type, value, data];
};
