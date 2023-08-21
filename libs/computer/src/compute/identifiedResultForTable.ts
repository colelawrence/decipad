import {
  buildType as t,
  serializeResult,
  AST,
  Result,
  isTableValue,
  tableValueToTableResultValue,
  sortValue,
} from '@decipad/language';
import { getDefined } from '@decipad/utils';
import stringify from 'json-stringify-safe';
import { ComputationRealm } from '../computer/ComputationRealm';

export const identifiedResultForTable = (
  realm: ComputationRealm,
  variableName: string | undefined,
  table: AST.Table
): Result.Result => {
  let type = getDefined(realm.inferContext.stack.get(getDefined(variableName)));
  let value = realm.interpreterRealm.stack.get(getDefined(variableName));
  if (type.columnNames?.length !== type.columnTypes?.length) {
    return serializeResult(
      t.impossible("column names and column types don't match length", table),
      null
    );
  }

  if (!value || !isTableValue(value)) {
    throw new Error(
      `table does not have table value: ${value}, ${stringify(value)}`
    );
  }

  [type, value] = sortValue(type, value);

  if (!value || !isTableValue(value)) {
    throw new Error(
      `table does not have table value: ${value}, ${stringify(value)}`
    );
  }
  if (
    value &&
    Array.isArray(value.columns) &&
    value.columns.length !== type.columnNames?.length
  ) {
    return serializeResult(
      t.impossible(
        "column names and result column count don't match length",
        table
      ),
      null
    );
  }
  return serializeResult(type, value && tableValueToTableResultValue(value));
};
