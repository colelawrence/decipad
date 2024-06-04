import type { AST, Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import {
  Value,
  buildType as t,
  tableValueToTableResultValue,
} from '@decipad/language';
import { getDefined } from '@decipad/utils';
import { serializeResult } from '@decipad/computer-utils';
import stringify from 'json-stringify-safe';
import type { ComputationRealm } from '../computer/ComputationRealm';

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
