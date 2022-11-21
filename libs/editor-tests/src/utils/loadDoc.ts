import { Document } from '@decipad/editor-types';
import { readFileSync } from 'fs';
import { join } from 'path';

export const loadDoc = (docPath: string): Document => {
  return JSON.parse(
    readFileSync(join(__dirname, '..', '__fixtures__', `${docPath}.json`), {
      encoding: 'utf8',
    })
  ) as unknown as Document;
};
