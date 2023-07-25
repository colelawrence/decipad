import { PlateComponent } from '@decipad/editor-types';
import { Heading2 as UIHeading2 } from '@decipad/ui';
import { DraggableBlock } from '../block-management';
import { useTurnIntoProps } from '../utils';

export const Heading2: PlateComponent = ({ attributes, children, element }) => {
  if (!element) {
    throw new Error('Heading2 is not a leaf');
  }

  const turnIntoProps = useTurnIntoProps(element);

  return (
    <DraggableBlock
      blockKind="heading2"
      element={element}
      {...turnIntoProps}
      {...attributes}
    >
      <UIHeading2 id={element.id}>{children}</UIHeading2>
    </DraggableBlock>
  );
};
