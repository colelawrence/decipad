import { useResults } from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import { PlateComponent } from '../../types';
import { Element } from '../../elements';

export const CodeBlock: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (!element) {
    throw new Error('CodeBlock is not a leaf');
  }

  const { blockResults } = useResults();
  const { children: lines } = element;

  if ('data-slate-leaf' in attributes) {
    throw new Error('CodeBlock is not a leaf');
  }

  // A code block has at least one line.
  const lastLineId = (lines[lines.length - 1] as Element).id ?? '';
  const lastLine = blockResults?.[lastLineId]?.results?.[0];
  return (
    <div {...attributes}>
      <organisms.CodeBlock expandedResult={lastLine}>
        {children}
      </organisms.CodeBlock>
    </div>
  );
};
