import { atoms } from '@decipad/ui';
import { types } from '@decipad/editor-config';
import { ELEMENT_COLUMNS } from '@decipad/editor-types';
import { DraggableBlock } from '../../components';

export const Columns: types.PlateComponent = ({
  attributes,
  children,
  element,
}) => {
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
