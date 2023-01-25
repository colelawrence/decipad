import { EditorColumns } from '@decipad/ui';
import { ELEMENT_COLUMNS, PlateComponent } from '@decipad/editor-types';
import { DraggableBlock } from '@decipad/editor-components';
import { useComputer } from '@decipad/react-contexts';

export const Columns: PlateComponent = ({ attributes, children, element }) => {
  if (!element || element.type !== ELEMENT_COLUMNS) {
    throw new Error('Columns is meant to render columns elements');
  }
  if ('data-slate-leaf' in attributes) {
    throw new Error('Columns is not a leaf');
  }

  const computer = useComputer();
  const childrenIds = element.children.map((child) => child.id);
  const inUse = computer.isInUse$.use(...childrenIds);

  return (
    <DraggableBlock
      blockKind="columns"
      element={element}
      disableDrag
      onDelete={inUse ? 'name-used' : undefined}
      {...attributes}
    >
      <EditorColumns>{children}</EditorColumns>
    </DraggableBlock>
  );
};
