import { molecules } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';
import { DraggableBlock } from '../block-management';

export const UnorderedList: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (!element) {
    throw new Error('UnorderedList is not a leaf');
  }

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="list" element={element}>
        <molecules.UnorderedList>{children}</molecules.UnorderedList>
      </DraggableBlock>
    </div>
  );
};
