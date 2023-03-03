import { MyValue } from '@decipad/editor-types';

export const applyReplaceList = (
  doc: MyValue,
  replaceList: Record<string, string>
): MyValue => {
  let docAsString = JSON.stringify(doc);

  for (const [oldValue, newValue] of Object.entries(replaceList)) {
    docAsString = docAsString.replaceAll(oldValue, newValue);
  }

  return JSON.parse(docAsString);
};
