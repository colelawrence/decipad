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
    <div {...attributes}>
      <DraggableBlock blockKind="list" element={element}>
        <UIUnorderedList>{children}</UIUnorderedList>
      </DraggableBlock>
    </div>
  );
};
