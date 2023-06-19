import { ImportElementSource } from '@decipad/editor-types';

export const maybeSourceFromFileType = (
  fileType: string
): ImportElementSource | void => {
  switch (fileType) {
    case 'text/csv':
      return 'csv';
    case 'application/json':
      return 'json';
  }
};
