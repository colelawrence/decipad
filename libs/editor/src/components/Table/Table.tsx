import { FC, useCallback } from 'react';
import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useEditorState } from '@udecode/plate';

import { TableInner } from './TableInner';
import { PlateComponent, TableData } from '../../types';
import { ELEMENT_TABLE_INPUT } from '../../elements';
import { DraggableBlock } from '../block-management';

export const Table: PlateComponent = ({
  children,
  element,
  attributes,
}): ReturnType<FC> => {
  if (element?.type !== ELEMENT_TABLE_INPUT) {
    throw new Error('Table is meant to render table elements');
  }

  const editor = useEditorState();

  const onChange = useCallback(
    (newValue: TableData) => {
      const at = ReactEditor.findPath(editor, element);

      Transforms.setNodes(editor, { tableData: newValue } as Partial<Node>, {
        at,
      });
    },
    [editor, element]
  );

  const value = element.tableData;

  // IMPORTANT NOTE: do not remove the children elements from rendering.
  // Even though they're one element with an empty text property, their absence triggers
  // an uncaught exception in slate-react.
  // Also, be careful with the element structure:
  // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696
  return (
    <div {...attributes}>
      <div contentEditable={false}>
        {children}
        <DraggableBlock blockKind="editorTable" element={element}>
          <TableInner value={value} onChange={onChange} />
        </DraggableBlock>
      </div>
    </div>
  );
};
