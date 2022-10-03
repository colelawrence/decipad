import { PlateComponent } from '@decipad/editor-types';
import { OrderedList as UIOrderedList } from '@decipad/ui';
import { DraggableBlock } from '../block-management';

export const OrderedList: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (!element) {
    throw new Error('UnorderedList is not a leaf');
  }

  return (
    <DraggableBlock blockKind="list" element={element} {...attributes}>
      <UIOrderedList>{children}</UIOrderedList>
    </DraggableBlock>
  );
};
