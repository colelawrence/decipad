import { atoms } from '@decipad/ui';
import { ELEMENT_COLUMNS, PlateComponent } from '@decipad/editor-types';
import { DraggableBlock } from '..';

export const Columns: PlateComponent = ({ attributes, children, element }) => {
  if (!element || element.type !== ELEMENT_COLUMNS) {
    throw new Error('Columns is meant to render columns elements');
  }
  if ('data-slate-leaf' in attributes) {
    throw new Error('Columns is not a leaf');
  }

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="interactive" element={element}>
        <atoms.EditorColumns>{children}</atoms.EditorColumns>
      </DraggableBlock>
    </div>
  );
};
