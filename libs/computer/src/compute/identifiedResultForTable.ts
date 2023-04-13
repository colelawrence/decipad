import { buildType as t, serializeResult, AST } from '@decipad/language';
import { getDefined } from '@decipad/utils';
import { ComputationRealm } from '../computer/ComputationRealm';

export const identifiedResultForTable = (
  realm: ComputationRealm,
  variableName: string | undefined,
  table: AST.Table
) => {
  const type = getDefined(
    realm.inferContext.stack.get(getDefined(variableName))
  );
  const value = realm.interpreterRealm.stack.get(getDefined(variableName));
  if (type.columnNames?.length !== type.columnTypes?.length) {
    return serializeResult(
      t.impossible("column names and column types don't match length", table),
      null
    );
  }
  const data = value?.getData();
  if (Array.isArray(data) && data.length !== type.columnNames?.length) {
    return serializeResult(
      t.impossible(
        "column names and result column count don't match length",
        table
      ),
      null
    );
  }
  return serializeResult(type, value?.getData());
};
