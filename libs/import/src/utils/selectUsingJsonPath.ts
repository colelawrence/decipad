import stringify from 'json-stringify-safe';
import type { query as JPQuery } from 'jsonpath';

// try load jsonpath, fails on SSR and that's ok
let jpQuery: typeof JPQuery;
try {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  jpQuery = require('jsonpath')?.query;
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Could not load jsonpath');
}

export const selectUsingJsonPath = (
  json: unknown,
  jsonPath: string
): unknown[] => {
  try {
    const result = jpQuery(json, jsonPath);
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
