import { IdentifiedResult, isSyntaxError } from '@decipad/language';
import { docs } from '@decipad/routing';
import { organisms, useResults } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';
import { useComputer } from '../../contexts/Computer';

export const CodeLine: PlateComponent = ({ attributes, children, element }) => {
  const computer = useComputer();
  const { blockResults: lineResults } = useResults();

  if (!element) {
    throw new Error('CodeBlock is not a leaf');
  }

  const { id: lineId } = element;
  if (lineId == null) {
    console.error('Missing line id in element: ', element);
    throw new Error('Missing line id.');
  }

  if ('data-slate-leaf' in attributes) {
    throw new Error('CodeLine is not a leaf');
  }

  const line = lineResults[lineId];
  const lineResult = line?.results[0];
  const statement = computer.getStatement(line?.blockId, 0);

  return (
    <div {...attributes}>
      <organisms.CodeLine
        displayInline={!computer.isLiteralValueOrAssignment(statement)}
        result={lineResult}
        syntaxError={getSyntaxError(line)}
      >
        {children}
      </organisms.CodeLine>
    </div>
  );
};

function getSyntaxError(line: IdentifiedResult) {
  return line != null && line.isSyntaxError
    ? {
        line: isSyntaxError(line.error) ? line.error.token.line + 1 : 1,
        message: 'Syntax Error',
        url: `${docs({}).$}/docs/language`,
      }
    : undefined;
}
