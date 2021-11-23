import { useCallback } from 'react';
import { organisms, useResults } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';
import { useComputer } from '../../contexts/Computer';

export const CodeBlock: PlatePluginComponent = ({
  attributes,
  children,
  element,
}) => {
  const computer = useComputer();
  const { blockResults } = useResults();

  const { id: blockId } = element;
  if (blockId == null) {
    console.error('Missing block id in element: ', element);
    throw new Error('Missing block id.');
  }

  const block = blockResults[blockId];

  // Avoids passing the computer down for just this functionality. Also avoids using `useComputer()`
  // on the ui lib which would mean importing the language at runtime (not just types).
  const getStatement = useCallback(
    (statementIndex) => {
      return computer.getStatement(blockId, statementIndex);
    },
    [computer, blockId]
  );

  if ('data-slate-leaf' in attributes) {
    throw new Error('CodeBlock is not a leaf');
  }

  return (
    <organisms.CodeBlock
      block={block}
      getStatement={getStatement}
      slateAttrs={attributes}
    >
      {children}
    </organisms.CodeBlock>
  );
};
