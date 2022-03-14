import { types } from '@decipad/editor-config';
import { atoms } from '@decipad/ui';
import { DraggableBlock } from '../../components';

export const Heading2: types.PlateComponent = ({
  attributes,
  children,
  element,
}) => {
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
