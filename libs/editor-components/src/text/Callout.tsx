import { atoms } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';
import { DraggableBlock } from '../block-management';

export const Callout: PlateComponent = ({ attributes, children, element }) => {
  if (!element) {
    throw new Error('Callout is not a leaf');
  }

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="callout" element={element}>
        <atoms.Callout>{children}</atoms.Callout>
      </DraggableBlock>
    </div>
  );
};
