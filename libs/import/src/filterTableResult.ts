import type { Result } from '@decipad/remote-computer';
import type { ImportOptions, ImportResult } from './types';

function getIndexes(arr: Array<string>, names: Set<string>): Array<number> {
  const indexes: Array<number> = [];

  for (const [index, item] of arr.entries()) {
    if (names.has(item)) {
      indexes.push(index);
    }
  }

  return indexes;
}

export function filterImportResult(
  imported: Array<ImportResult>,
  options: ImportOptions
): Array<ImportResult> {
  for (const res of imported) {
    if (res.result == null) {
      continue;
    }

    res.result = filterTableResult(res.result, options);
  }

  return imported;
}

export function filterTableResult(
  result: Result.Result,
  options: ImportOptions
): Result.Result {
  if (
    result.type.kind !== 'table' &&
    result.type.kind !== 'materialized-table'
  ) {
    return result;
  }

  const tableResult = result as
    | Result.Result<'table'>
    | Result.Result<'materialized-table'>;

  const indexesToRemove = getIndexes(
    tableResult.type.columnNames,
    options.columnsToIgnore ?? new Set()
  );

  for (let i = indexesToRemove.length - 1; i >= 0; i--) {
    tableResult.type.columnNames.splice(indexesToRemove[i], 1);
    tableResult.type.columnTypes.splice(indexesToRemove[i], 1);
    tableResult.value.splice(indexesToRemove[i], 1);
  }

  if (
    tableResult.type.indexName != null &&
    !tableResult.type.columnNames.includes(tableResult.type.indexName)
  ) {
    tableResult.type.indexName = tableResult.type.columnNames[0] ?? null;
  }

  return result;
}
