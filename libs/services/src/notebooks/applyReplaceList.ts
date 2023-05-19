import stringify from 'json-stringify-safe';
import type { MyValue } from '@decipad/editor-types';
import type { ReplaceList } from './types';

export const applyReplaceList = (
  doc: MyValue,
  replaceList: ReplaceList
): MyValue => {
  let docAsString = stringify(doc);

  for (const [oldValue, newValue] of Object.entries(replaceList)) {
    docAsString = docAsString.replaceAll(oldValue, newValue);
  }

  return JSON.parse(docAsString);
};
