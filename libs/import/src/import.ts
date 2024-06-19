import { importFromUnknown } from './importFromUnknown';
import { decipad, gsheets, notion, mysql, csv } from './providers';
import type { ImportOptions, ImportParams, ImportResult } from './types';

const internalTryImport = (
  params: ImportParams,
  options: ImportOptions = {}
): Promise<ImportResult[]> => {
  if (params.provider) {
    switch (params.provider) {
      case 'gsheets':
        return gsheets.import(params, options);
      case 'decipad':
        return decipad.import(params.url);
      case 'notion':
        return notion.import(params, options);
      case 'mysql':
        return mysql.import(params, options);
      case 'csv':
        return csv.import(params, options);
    }
  }
  return importFromUnknown(params.computer, params.proxy ?? params.url, {
    ...options,
    provider: params.provider,
  });
};

export const tryImport = async (
  params: ImportParams,
  options: ImportOptions = {}
): Promise<ImportResult[]> => {
  const { identifyIslands, ...restOptions } = options;
  let result = await internalTryImport(params, options);
  if (result.length === 1 && identifyIslands) {
    result = await internalTryImport(params, restOptions);
  }
  return result;
};
