import { EditorColumns } from '@decipad/ui';
import { ELEMENT_COLUMNS, PlateComponent } from '@decipad/editor-types';
import { DraggableBlock } from '@decipad/editor-components';

export const Columns: PlateComponent = ({ attributes, children, element }) => {
  if (!element || element.type !== ELEMENT_COLUMNS) {
    throw new Error('Columns is meant to render columns elements');
  }
  if ('data-slate-leaf' in attributes) {
    throw new Error('Columns is not a leaf');
  }

  return (
    <DraggableBlock blockKind="columns" element={element} {...attributes}>
      <EditorColumns>{children}</EditorColumns>
    </DraggableBlock>
  );
};
