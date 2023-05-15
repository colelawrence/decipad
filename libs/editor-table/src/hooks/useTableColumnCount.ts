import { ELEMENT_TABLE, MyElement } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useElementAbove } from '@decipad/editor-hooks';
import { isTable } from '../utils/isTable';

export const useTableColumnCount = (element: MyElement): number | undefined => {
  const table = useElementAbove(element, { match: isTable });
  if (table) {
    assertElementType(table, ELEMENT_TABLE);
    return table.children[1]?.children.length;
  }
  return undefined;
};
