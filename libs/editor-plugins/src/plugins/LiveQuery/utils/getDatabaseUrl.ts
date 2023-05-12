import { Result, isTableResult } from '@decipad/computer';

export const getDatabaseUrl = async (
  result: Result.Result
): Promise<string | undefined> => {
  if (isTableResult(result)) {
    const { type } = result;
    const urlColumnIndex = type.columnNames.indexOf('url');
    if (urlColumnIndex >= 0) {
      const value = result.value as Result.Result<'table'>['value'];
      const valueGen = value?.[urlColumnIndex];
      if (!valueGen) return undefined;
      const myThing = await valueGen().next();
      return myThing.value;
    }
  }
  return undefined;
};
