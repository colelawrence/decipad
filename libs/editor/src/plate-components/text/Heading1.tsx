import { types } from '@decipad/editor-config';
import { atoms } from '@decipad/ui';
import { DraggableBlock } from '../../components';

export const Heading1: types.PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (!element) {
    throw new Error('Heading1 is not a leaf');
  }

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="heading1" element={element}>
        <atoms.Heading1 Heading="h2">{children}</atoms.Heading1>
      </DraggableBlock>
    </div>
  );
};
