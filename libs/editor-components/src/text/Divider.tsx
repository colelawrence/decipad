import { atoms } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';
import { DraggableBlock } from '../block-management';

export const Divider: PlateComponent = ({ attributes, element }) => {
  if (!element) {
    throw new Error('Divider is not a leaf');
  }

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="paragraph" element={element}>
        <atoms.Divider></atoms.Divider>
      </DraggableBlock>
    </div>
  );
};
