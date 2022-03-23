import { ELEMENT_CODE_BLOCK, PlateComponent } from '@decipad/editor-types';
import { useResult } from '@decipad/react-contexts';
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

  const { children: lines } = element;
  const lastLineId = lines[lines.length - 1].id;

  const lastLine = useResult(lastLineId)?.results?.[0];

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="codeBlock" element={element}>
        <organisms.CodeBlock expandedResult={lastLine}>
          {children}
        </organisms.CodeBlock>
      </DraggableBlock>
    </div>
  );
};
