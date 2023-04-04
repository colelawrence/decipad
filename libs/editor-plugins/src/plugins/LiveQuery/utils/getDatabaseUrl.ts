import { Result } from '@decipad/computer';

export const getDatabaseUrl = (result: Result.Result): string | undefined => {
  const { type } = result;
  if (type.kind === 'table') {
    const urlColumnIndex = type.columnNames.indexOf('url');
    if (urlColumnIndex >= 0) {
      const value = result.value as Result.Result<'table'>['value'];
      return value[urlColumnIndex]?.[0]?.toString();
    }
  }
  return undefined;
};
