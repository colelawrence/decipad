import {
  IdentifiedResult,
  isSyntaxError,
  isBracketError,
} from '@decipad/language';
import { useResults } from '@decipad/react-contexts';
import { docs } from '@decipad/routing';
import { organisms } from '@decipad/ui';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { PlateComponent } from '../../types';
import { useComputer } from '../../contexts/Computer';

export const CodeLine: PlateComponent = ({ attributes, children, element }) => {
  if (!element || element.type !== ELEMENT_CODE_LINE) {
    throw new Error('CodeLine is meant to render code line elements');
  }
  if ('data-slate-leaf' in attributes) {
    throw new Error('CodeLine is not a leaf');
  }

  const computer = useComputer();
  const { blockResults: lineResults } = useResults();

  const { id: lineId } = element;

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
      url: docs({}).page({ name: 'errors' }).$,
    };
  }
  return isSyntaxError(error)
    ? {
        line: isSyntaxError(error) && error.line != null ? error.line : 1,
        column: isSyntaxError(error) && error.column != null ? error.column : 1,
        message: error.message,
        detailMessage: error.detailMessage,
        expected: error.expected,
        url: `${docs({}).page({ name: 'errors' }).$}#syntax-error`,
      }
    : isBracketError(error.bracketError)
    ? {
        message: 'Bracket error',
        bracketError: error.bracketError,
        url: `${docs({}).page({ name: 'errors' }).$}#syntax-error`,
      }
    : {
        message: error.message,
        url: docs({}).page({ name: 'errors' }).$,
      };
}
