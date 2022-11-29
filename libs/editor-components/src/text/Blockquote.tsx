import { PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { Blockquote as UIBlockquote } from '@decipad/ui';
import { DraggableBlock } from '../block-management';
import { useTurnIntoProps } from '../utils';

export const Blockquote: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, 'blockquote');
  const turnIntoProps = useTurnIntoProps(element);

  return (
    <DraggableBlock
      blockKind="blockquote"
      element={element}
      {...turnIntoProps}
      {...attributes}
    >
      <UIBlockquote>{children}</UIBlockquote>
    </DraggableBlock>
  );
};
