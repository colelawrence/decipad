import { Result, isTableResult } from '@decipad/computer';

export const getDatabaseUrl = (result: Result.Result): string | undefined => {
  if (isTableResult(result)) {
    const { type } = result;
    const urlColumnIndex = type.columnNames.indexOf('url');
    if (urlColumnIndex >= 0) {
      const value =
        result.value as Result.Result<'materialized-table'>['value'];
      return value[urlColumnIndex]?.[0]?.toString();
    }
  }
  return undefined;
};
