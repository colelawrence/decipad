import { PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { atoms } from '@decipad/ui';
import { DraggableBlock } from '../block-management';

export const Blockquote: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, 'blockquote');

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="blockquote" element={element}>
        <atoms.Blockquote>{children}</atoms.Blockquote>
      </DraggableBlock>
    </div>
  );
};
