import type { PlateComponent } from '@decipad/editor-types';
import { Divider as UIDivider } from '@decipad/ui';
import { DraggableBlock } from '../block-management';

export const Divider: PlateComponent = ({ attributes, element, children }) => {
  if (!element) {
    throw new Error('Divider is not a leaf');
  }

  return (
    <DraggableBlock blockKind="divider" element={element} {...attributes}>
      {children}
      <UIDivider />
    </DraggableBlock>
  );
};
