import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TR,
  getAbove,
  getPlatePluginType,
  insertNodes,
  someNode,
  SPEditor,
  TElement,
} from '@udecode/plate';
import { Path } from 'slate';

export const addRow = (editor: SPEditor): void => {
  if (
    someNode(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentRowItem = getAbove(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TR) },
    });
    if (currentRowItem) {
      const [currentRowElem, currentRowPath] = currentRowItem;
      const colCount = currentRowElem.children.length;
      insertNodes<TElement>(
        editor,
        {
          type: getPlatePluginType(editor, ELEMENT_TR),
          children: Array(colCount)
            .fill(colCount)
            .map(() => ({
              type: getPlatePluginType(editor, ELEMENT_TD),
              children: [{ text: '' }],
            })),
        },
        {
          at: Path.next(currentRowPath),
          select: true,
        }
      );
    }
  }
};
