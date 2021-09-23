import {
  PlatePluginComponent,
  useEventEditorId,
  useStoreEditorState,
  ELEMENT_TD,
  ELEMENT_TR,
  getAbove,
  insertNodes,
  TElement,
} from '@udecode/plate';
import { TableElement } from '@decipad/ui';
import { FC } from 'react';

import { Editor, Path } from 'slate';

// TODO should work without focus, just append at the end
export const addRow = (editor: Editor): void => {
  const currentRowItem = getAbove(editor, {
    match: { type: ELEMENT_TR },
  });
  if (currentRowItem) {
    const [currentRowElem, currentRowPath] = currentRowItem;
    const colCount = currentRowElem.children.length;
    insertNodes<TElement>(
      editor,
      {
        type: ELEMENT_TR,
        children: Array(colCount)
          .fill(colCount)
          .map(() => ({
            type: ELEMENT_TD,
            children: [{ text: '' }],
          })),
      },
      {
        at: Path.next(currentRowPath),
        select: true,
      }
    );
  }
};

export const Table: PlatePluginComponent = (props): ReturnType<FC> => {
  const editor = useStoreEditorState(useEventEditorId('focus'));
  if (!editor) {
    throw new Error('missing editor');
  }

  return <TableElement {...props} onAddRow={() => addRow(editor)} />;
};
