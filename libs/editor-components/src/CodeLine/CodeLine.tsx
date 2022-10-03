import {
  IdentifiedError,
  IdentifiedResult,
  isBracketError,
  isSyntaxError,
  Result,
} from '@decipad/computer';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_DISPLAY,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useResult } from '@decipad/react-contexts';
import { docs } from '@decipad/routing';
import { CodeLine as UICodeLine } from '@decipad/ui';
import { getNodeString, findNodePath, insertNodes } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { useCallback, useMemo } from 'react';
import { useSelected } from 'slate-react';
import { DraggableBlock } from '../block-management';
import { onDragStartInlineResult } from './onDragStartInlineResult';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';
import { useCodeLineClickReference } from './useCodeLineClickReference';

export const CodeLine: PlateComponent = ({ attributes, children, element }) => {
  if (!element || element.type !== ELEMENT_CODE_LINE) {
    throw new Error('CodeLine is meant to render code line elements');
  }
  if ('data-slate-leaf' in attributes) {
    throw new Error('CodeLine is not a leaf');
  }

  const selected = useSelected();
  const editor = useTEditorRef();

  const { id: lineId } = element;

  const lineResult = useResult(lineId);
  const syntaxError = useMemo(() => getSyntaxError(lineResult), [lineResult]);

  const codeLineContent = getNodeString(element);

  useCodeLineClickReference(editor, selected, codeLineContent);

  const onClickedResult = useCallback(
    (result: Result.Result) => {
      if (
        !(
          result.type.kind === 'number' ||
          result.type.kind === 'date' ||
          result.type.kind === 'string' ||
          result.type.kind === 'boolean'
        )
      )
        return;

      const path = findNodePath(editor, element);
      if (!path) return;

      insertNodes(
        editor,
        {
          id: nanoid(),
          type: ELEMENT_DISPLAY,
          blockId: element.id,
          children: [{ text: '' }],
        },
        {
          at: [path[0] + 1],
        }
      );
    },
    [editor, element]
  );

  return (
    <div {...attributes} id={lineId}>
      <DraggableBlock blockKind="codeLine" element={element}>
        <UICodeLine
          highlight={selected}
          result={lineResult?.result}
          placeholder="Distance = 60 km/h * Time"
          syntaxError={syntaxError}
          onDragStartInlineResult={onDragStartInlineResult(editor, { element })}
          onDragStartCell={onDragStartTableCellResult(editor)}
          onClickedResult={
            isFlagEnabled('RESULT_WIDGET') ? onClickedResult : undefined
          }
        >
          {children}
        </UICodeLine>
      </DraggableBlock>
    </div>
  );
};

function getSyntaxError(line?: IdentifiedResult | IdentifiedError) {
  const error = line?.error;
  if (!error) {
    return undefined;
  }

  return isSyntaxError(error)
    ? {
        line: error && error.line != null ? error.line : 1,
        column: error && error.column != null ? error.column : 1,
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
