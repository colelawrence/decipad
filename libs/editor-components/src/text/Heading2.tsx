import { PlateComponent } from '@decipad/editor-types';
import { atoms } from '@decipad/ui';
import { DraggableBlock } from '../block-management';

export const Heading2: PlateComponent = ({ attributes, children, element }) => {
  if (!element) {
    throw new Error('Heading2 is not a leaf');
  }

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="heading2" element={element}>
        <atoms.Heading2 Heading="h3">{children}</atoms.Heading2>
      </DraggableBlock>
    </div>
  );
};
