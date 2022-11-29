import { PlateComponent } from '@decipad/editor-types';
import { Heading1 as UIHeading1 } from '@decipad/ui';
import { DraggableBlock } from '../block-management';
import { useTurnIntoProps } from '../utils';

export const Heading1: PlateComponent = ({ attributes, children, element }) => {
  if (!element) {
    throw new Error('Heading1 is not a leaf');
  }

  const turnIntoProps = useTurnIntoProps(element);

  return (
    <DraggableBlock
      blockKind="heading1"
      element={element}
      {...turnIntoProps}
      {...attributes}
    >
      <UIHeading1 id={element.id} Heading="h2">
        {children}
      </UIHeading1>
    </DraggableBlock>
  );
};
