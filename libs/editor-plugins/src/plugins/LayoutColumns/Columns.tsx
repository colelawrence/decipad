import { DraggableBlock } from '@decipad/editor-components';
import { ELEMENT_COLUMNS, PlateComponent } from '@decipad/editor-types';
import { EditorColumns } from '@decipad/ui';

export const Columns: PlateComponent = ({ attributes, children, element }) => {
  if (!element || element.type !== ELEMENT_COLUMNS) {
    throw new Error('Columns is meant to render columns elements');
  }
  if ('data-slate-leaf' in attributes) {
    throw new Error('Columns is not a leaf');
  }

  const dependencyId = element.children.map((child) => child.id);

  return (
    <DraggableBlock
      blockKind="columns"
      element={element}
      disableDrag
      dependencyId={dependencyId}
      {...attributes}
    >
      <EditorColumns>{children}</EditorColumns>
    </DraggableBlock>
  );
};
