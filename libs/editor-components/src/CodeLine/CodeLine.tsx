import {
  IdentifiedResult,
  isBracketError,
  isSyntaxError,
} from '@decipad/computer';
import {
  ELEMENT_CODE_LINE,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { useComputer, useResult } from '@decipad/react-contexts';
import { docs } from '@decipad/routing';
import { organisms } from '@decipad/ui';
import { useSelected } from 'slate-react';
import { DraggableBlock } from '../block-management';
import { onDragStartInlineResult } from './onDragStartInlineResult';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';

export const CodeLine: PlateComponent = ({ attributes, children, element }) => {
  if (!element || element.type !== ELEMENT_CODE_LINE) {
    throw new Error('CodeLine is meant to render code line elements');
  }
  if ('data-slate-leaf' in attributes) {
    throw new Error('CodeLine is not a leaf');
  }

  const computer = useComputer();
  const selected = useSelected();
  const editor = useTEditorRef();

  const { id: lineId } = element;
  const line = useResult(lineId);

  const lineResult = line?.results[0];
  const statement = computer.getStatement(lineId, 0);
  const syntaxError = getSyntaxError(line);

  return (
    <div {...attributes} id={lineId}>
      <DraggableBlock blockKind="codeLine" element={element}>
        <organisms.CodeLine
          displayInline={!computer.isLiteralValueOrAssignment(statement)}
          highlight={selected}
          result={lineResult}
          syntaxError={syntaxError}
          onDragStartInlineResult={onDragStartInlineResult(editor, { element })}
          onDragStartCell={onDragStartTableCellResult(editor)}
        >
          {children}
        </organisms.CodeLine>
      </DraggableBlock>
    </div>
  );
};

function getSyntaxError(line: IdentifiedResult | null) {
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
