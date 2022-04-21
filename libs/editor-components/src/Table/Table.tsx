import { ELEMENT_TABLE_INPUT, PlateComponent } from '@decipad/editor-types';
import { useEditorState } from '@udecode/plate';
import { FC } from 'react';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { DraggableBlock } from '@decipad/editor-components';
import { TableInner } from './TableInner';

export const Table: PlateComponent = ({
  children,
  element,
  attributes,
}): ReturnType<FC> => {
  if (element?.type !== ELEMENT_TABLE_INPUT) {
    throw new Error('Table is meant to render table elements');
  }

  const editor = useEditorState();

  const onChange = useElementMutatorCallback(editor, element, 'tableData');

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
