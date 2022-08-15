import { Result } from '@decipad/computer';
import { ImportElementSource } from '@decipad/editor-types';
import { gsheets } from './providers';

export const tryImport = (
  provider: ImportElementSource,
  url: URL
): Promise<Result.Result> => {
  switch (provider) {
    case 'gsheets':
      return gsheets.import(url);
  }
};
