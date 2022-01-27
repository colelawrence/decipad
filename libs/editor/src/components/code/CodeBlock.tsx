import { useResults } from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import { ELEMENT_CODE_BLOCK } from '../../elements';
import { PlateComponent } from '../../types';

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

  const { blockResults } = useResults();
  const { children: lines } = element;

  // A code block has at least one line.
  const lastLineId = lines[lines.length - 1].id ?? '';
  const lastLine = blockResults?.[lastLineId]?.results?.[0];
  return (
    <div {...attributes}>
      <organisms.CodeBlock expandedResult={lastLine}>
        {children}
      </organisms.CodeBlock>
    </div>
  );
};
