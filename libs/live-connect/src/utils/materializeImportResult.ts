import { ImportResult } from '@decipad/import';
import { materializeResult } from '@decipad/computer';

export const materializeImportResult = async (
  result: ImportResult
): Promise<ImportResult> => {
  return {
    ...result,
    result:
      result.result == null
        ? undefined
        : await materializeResult(result.result),
  };
};
