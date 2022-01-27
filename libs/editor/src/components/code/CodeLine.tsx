import {
  IdentifiedResult,
  isSyntaxError,
  isBracketError,
} from '@decipad/language';
import { useResults } from '@decipad/react-contexts';
import { docs } from '@decipad/routing';
import { organisms } from '@decipad/ui';
import { PlateComponent } from '../../types';
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
  const syntaxError = getSyntaxError(line);

  return (
    <div {...attributes}>
      <organisms.CodeLine
        displayInline={!computer.isLiteralValueOrAssignment(statement)}
        result={lineResult}
        syntaxError={syntaxError}
      >
        {children}
      </organisms.CodeLine>
    </div>
  );
};

function getSyntaxError(line: IdentifiedResult) {
  if (!line || !line.error) {
    return undefined;
  }
  const { error } = line;
  if (!line.isSyntaxError) {
    return {
      message: error.message,
      url: `${docs({}).$}/errors`,
    };
  }
  return isSyntaxError(error)
    ? {
        line: isSyntaxError(error) && error.line != null ? error.line : 1,
        column: isSyntaxError(error) && error.column != null ? error.column : 1,
        message: error.message,
        detailMessage: error.detailMessage,
        expected: error.expected,
        url: `${docs({}).$}/errors#syntax-error`,
      }
    : isBracketError(error.bracketError)
    ? {
        message: 'Bracket error',
        bracketError: error.bracketError,
        url: `${docs({}).$}/errors#syntax-error`,
      }
    : {
        message: error.message,
        url: `${docs({}).$}/errors`,
      };
}
