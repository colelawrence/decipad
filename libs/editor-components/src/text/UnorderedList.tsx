import { PlateComponent } from '@decipad/editor-types';
import { UnorderedList as UIUnorderedList } from '@decipad/ui';
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
    <DraggableBlock blockKind="list" element={element} {...attributes}>
      <UIUnorderedList>{children}</UIUnorderedList>
    </DraggableBlock>
  );
};
