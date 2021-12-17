import { organisms, useResults, Statement } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';
import { docs } from '@decipad/routing';
import {
  Computer,
  IdentifiedResult,
  isSyntaxError,
  serializeResult,
} from '@decipad/language';
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

  if ('data-slate-leaf' in attributes) {
    throw new Error('CodeBlock is not a leaf');
  }

  const block = blockResults[blockId];

  return (
    <organisms.CodeBlock
      blockId={blockId}
      error={getSyntaxError(block)}
      statements={blockToProps(block, computer)}
      slateAttrs={attributes}
    >
      {children}
    </organisms.CodeBlock>
  );
};

function getSyntaxError(block: IdentifiedResult) {
  return block != null && block.isSyntaxError
    ? {
        line: isSyntaxError(block.error) ? block.error.token.line + 1 : 1,
        message: 'Syntax Error',
        url: `${docs({}).$}/docs/language`,
      }
    : undefined;
}

function blockToProps(
  block: IdentifiedResult | undefined,
  computer: Computer
): Statement[] {
  if (block == null) {
    return [];
  }

  return block.results
    .filter(({ statementIndex }) => {
      const statement = computer.getStatement(block.blockId, statementIndex);
      return statement?.start?.line != null && statement?.end?.line != null;
    })
    .map(({ statementIndex, value, valueType }) => {
      const statement = computer.getStatement(block.blockId, statementIndex);
      return {
        displayInline: !computer.isLiteralValueOrAssignment(statement),
        endLine: statement?.end?.line ?? 0,
        startLine: statement?.start?.line ?? 0,
        result: serializeResult(valueType, value),
      };
    });
}
