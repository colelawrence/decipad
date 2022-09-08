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
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions?: Record<ColIndex, TableCellType>;
  doNotTryExpressionNumbersParse?: boolean;
}

export const tryImport = (
  computer: Computer,
  url: URL,
  provider?: ImportElementSource,
  options: ImportOptions = {}
): Promise<ImportResult> => {
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
