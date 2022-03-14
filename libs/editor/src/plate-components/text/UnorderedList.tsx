import { types } from '@decipad/editor-config';
import { molecules } from '@decipad/ui';
import { DraggableBlock } from '../../components';

export const UnorderedList: types.PlateComponent = ({
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
