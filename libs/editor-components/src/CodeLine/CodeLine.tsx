import {
  IdentifiedError,
  IdentifiedResult,
  isBracketError,
  isSyntaxError,
} from '@decipad/computer';
import {
  ELEMENT_CODE_LINE,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { useResult } from '@decipad/react-contexts';
import { docs } from '@decipad/routing';
import { isNodeEmpty, CodeLine as UICodeLine } from '@decipad/ui';
import { getNodeString } from '@udecode/plate';
import { useSelected } from 'slate-react';
import { DraggableBlock } from '../block-management';
import { onDragStartInlineResult } from './onDragStartInlineResult';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';
import { useCodeLineClickReference } from './useCodeLineClickReference';
import { useCodeLineTutorials } from './useCodeLineTutorials';

export const CodeLine: PlateComponent = ({ attributes, children, element }) => {
  if (!element || element.type !== ELEMENT_CODE_LINE) {
    throw new Error('CodeLine is meant to render code line elements');
  }
  if ('data-slate-leaf' in attributes) {
    throw new Error('CodeLine is not a leaf');
  }

  const selected = useSelected();
  const editor = useTEditorRef();
  const isEmpty = isNodeEmpty(children);

  const { id: lineId } = element;
  const line = useResult(lineId);
  const lineResult = line?.result;

  const { tips, placeholder } = useCodeLineTutorials(selected, isEmpty);
  const syntaxError = getSyntaxError(line);
  const codeLineContent = getNodeString(element);

  useCodeLineClickReference(editor, selected, codeLineContent);

  return (
    <div {...attributes} id={lineId}>
      <DraggableBlock blockKind="codeLine" element={element}>
        <UICodeLine
          highlight={selected}
          result={lineResult}
          tip={tips}
          placeholder={placeholder}
          syntaxError={syntaxError}
          onDragStartInlineResult={onDragStartInlineResult(editor, { element })}
          onDragStartCell={onDragStartTableCellResult(editor)}
        >
          {children}
        </UICodeLine>
      </DraggableBlock>
    </div>
  );
};

function getSyntaxError(line: IdentifiedResult | IdentifiedError | null) {
  const error = line?.error;
  if (!error) {
    return undefined;
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
