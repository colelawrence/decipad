import {
  PlatePluginComponent,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/plate';
import { Editor, Node, Path, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useCallback } from 'react';

import { ThElement } from '@decipad/ui';
import { isInteractiveTable } from '../../plugins/Language/extractTable';
import { TableCellType } from '../../plugins/InteractiveTable/table';

export const changeColumnType = (
  editor: Editor,
  thPath: Path,
  cellType: TableCellType
): void => {
  const columnIndex = thPath[thPath.length - 1];
  const [table, tableLoc] =
    Editor.above(editor, {
      at: thPath,
      match: isInteractiveTable,
    }) ?? [];
  const [th, thLoc] = Editor.node(editor, thPath) ?? [];

  if (!table || !tableLoc || !th || !thLoc)
    throw new Error('Cannot find column and table to change column type');

  Editor.withoutNormalizing(editor, () => {
    const typeAttributes = {
      attributes: { cellType },
    } as Partial<Node>;

    // Change the type in the header
    Transforms.setNodes(editor, typeAttributes, { at: thPath });

    // Change the cells in this column
    for (
      let rowIndex = 0;
      rowIndex < table.children[2].children.length;
      rowIndex += 1
    ) {
      const cellPath = [...tableLoc, 2, rowIndex, columnIndex];
      // Change the type in the cell
      Transforms.setNodes(editor, typeAttributes, { at: cellPath });

      const cellTextPath = [...cellPath, 0];
      const currentText = Editor.string(editor, cellTextPath);

      const text = (() => {
        switch (cellType) {
          case 'number': {
            return !Number.isNaN(Number(currentText)) ? currentText : '';
          }
          case 'string': {
            return currentText;
          }
        }
      })();

      Transforms.removeNodes(editor, { at: cellTextPath });
      Transforms.insertNodes(editor, { text }, { at: cellTextPath });
    }
  });
};

export const HeadTh: PlatePluginComponent = ({ element, ...props }) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));
  if (!editor) {
    throw new Error('missing editor');
  }

  const onChangeColumnType = useCallback(
    (newType: TableCellType) => {
      changeColumnType(editor, ReactEditor.findPath(editor, element), newType);
    },
    [editor, element]
  );

  return (
    <ThElement
      {...props}
      element={element}
      onChangeColumnType={onChangeColumnType}
    />
  );
};
