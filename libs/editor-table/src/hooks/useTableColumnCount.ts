import { ELEMENT_TABLE, MyElement } from '@decipad/editor-types';
import { assertElementType, useElementAbove } from '@decipad/editor-utils';
import { isTable } from '../utils/isTable';

export const useTableColumnCount = (element: MyElement): number | undefined => {
  const table = useElementAbove(element, { match: isTable });
  if (table) {
    assertElementType(table, ELEMENT_TABLE);
    return table.children[1]?.children.length;
  }
  return undefined;
};
