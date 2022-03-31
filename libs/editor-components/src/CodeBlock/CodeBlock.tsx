import { ELEMENT_CODE_BLOCK, PlateComponent } from '@decipad/editor-types';
import { organisms } from '@decipad/ui';
import { DraggableBlock } from '@decipad/editor-components';

export const CodeBlock: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (!element || element.type !== ELEMENT_CODE_BLOCK) {
    throw new Error('CodeBlock is meant to render code block elements');
  }
  if ('data-slate-leaf' in attributes) {
    throw new Error('CodeBlock is not a leaf');
  }

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="codeBlock" element={element}>
        <organisms.CodeBlock>{children}</organisms.CodeBlock>
      </DraggableBlock>
    </div>
  );
};
