import { Computer } from '@decipad/computer';
import {
  ColIndex,
  ImportElementSource,
  TableCellType,
} from '@decipad/editor-types';
import { importFromUnknown } from './importFromUnknown';
import { decipad, gsheets } from './providers';
import { ImportResult } from './types';

export interface ImportParams {
  computer: Computer;
  url: URL;
  proxy?: URL;
  provider?: ImportElementSource;
}
export interface ImportOptions {
  identifyIslands?: boolean;
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions?: Record<ColIndex, TableCellType>;
  doNotTryExpressionNumbersParse?: boolean;
  maxCellCount?: number;
}

const internalTryImport = (
  params: ImportParams,
  options: ImportOptions = {}
): Promise<ImportResult[]> => {
  if (params.provider) {
    switch (params.provider) {
      case 'gsheets':
        return gsheets.import(params, options);
      case 'decipad':
        return decipad.import();
    }
  }
  return importFromUnknown(
    params.computer,
    params.proxy ?? params.url,
    options
  );
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
