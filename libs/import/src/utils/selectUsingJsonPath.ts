import stringify from 'json-stringify-safe';
import { JSONPath } from 'jsonpath-plus';

export const selectUsingJsonPath = (
  json: unknown,
  jsonPath: string
): unknown[] => {
  try {
    const result = JSONPath({ path: jsonPath, json: json as JSON });
    if (result.length === 1) {
      return result[0];
    }
    return result;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Error trying to use JSONpath expression ${jsonPath}`, err);
    throw new Error(
      `JSON Path error ${(err as Error).message}: ${stringify(jsonPath)}`
    );
  }
};
