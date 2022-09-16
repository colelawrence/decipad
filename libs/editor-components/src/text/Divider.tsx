import { DividerBlock } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';
import { DraggableBlock } from '../block-management';

export const Divider: PlateComponent = ({ attributes, element, children }) => {
  if (!element) {
    throw new Error('Divider is not a leaf');
  }

  return (
    <div {...attributes} contentEditable={false}>
      {children}
      <DraggableBlock blockKind="divider" element={element}>
        <DividerBlock />
      </DraggableBlock>
    </div>
  );
};
