import { PlateComponent } from '@decipad/editor-types';
import { Heading2 as UIHeading2 } from '@decipad/ui';
import { DraggableBlock } from '../block-management';

export const Heading2: PlateComponent = ({ attributes, children, element }) => {
  if (!element) {
    throw new Error('Heading2 is not a leaf');
  }

  return (
    <DraggableBlock blockKind="heading2" element={element} {...attributes}>
      <UIHeading2 Heading="h3">{children}</UIHeading2>
    </DraggableBlock>
  );
};
