import { Computer } from '@decipad/computer';
import {
  ColIndex,
  ImportElementSource,
  TableCellType,
} from '@decipad/editor-types';
import { importFromUnknown } from './importFromUnknown';
import { decipad, gsheets } from './providers';
import { ImportResult } from './types';

export interface ImportOptions {
  identifyIslands?: boolean;
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions?: Record<ColIndex, TableCellType>;
  doNotTryExpressionNumbersParse?: boolean;
  maxCellCount?: number;
}

const internalTryImport = (
  computer: Computer,
  url: URL,
  provider?: ImportElementSource,
  options: ImportOptions = {}
): Promise<ImportResult[]> => {
  if (provider) {
    switch (provider) {
      case 'gsheets':
        return gsheets.import(computer, url, options);
      case 'decipad':
        return decipad.import();
    }
  }
  return importFromUnknown(computer, url, options);
};

export const tryImport = async (
  computer: Computer,
  url: URL,
  provider?: ImportElementSource,
  options: ImportOptions = {}
): Promise<ImportResult[]> => {
  const { identifyIslands, ...restOptions } = options;
  let result = await internalTryImport(computer, url, provider, options);
  if (result.length === 1 && identifyIslands) {
    result = await internalTryImport(computer, url, provider, restOptions);
  }
  return result;
};
