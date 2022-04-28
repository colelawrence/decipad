import { PlateComponent } from '@decipad/editor-types';
import { atoms } from '@decipad/ui';
import { DraggableBlock } from '../block-management';

export const Blockquote: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (!element) {
    throw new Error('Blockquote is not a leaf');
  }

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="blockquote" element={element}>
        <atoms.Blockquote>{children}</atoms.Blockquote>
      </DraggableBlock>
    </div>
  );
};
