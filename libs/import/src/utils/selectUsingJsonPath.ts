import jp from 'jsonpath';

export const selectUsingJsonPath = (
  json: unknown,
  jsonPath: string
): unknown[] => {
  try {
    const result = jp.query(json, jsonPath);
    if (result.length === 1) {
      return result[0];
    }
    return result;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Error trying to use JSONpath expression ${jsonPath}`, err);
    throw new Error(
      `JSON Path error ${(err as Error).message}: ${JSON.stringify(jsonPath)}`
    );
  }
};
