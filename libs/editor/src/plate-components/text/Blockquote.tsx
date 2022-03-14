import { types } from '@decipad/editor-config';
import { atoms } from '@decipad/ui';
import { DraggableBlock } from '../../components';

export const Blockquote: types.PlateComponent = ({
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
