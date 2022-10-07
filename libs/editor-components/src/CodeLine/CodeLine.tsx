import { Result } from '@decipad/computer';
import {
  DisplayElement,
  ELEMENT_CODE_LINE,
  ELEMENT_DISPLAY,
  MyElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, useNodeText } from '@decipad/editor-utils';
import { useComputer, useEditorChangeState } from '@decipad/react-contexts';
import { CodeLine as UICodeLine } from '@decipad/ui';
import {
  findNodePath,
  insertNodes,
  getNextNode,
  isElement,
  getPreviousNode,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { ReactEditor, useSelected } from 'slate-react';
import { useCallback } from 'react';
import { DraggableBlock } from '../block-management';
import { getSyntaxError } from './getSyntaxError';
import { onDragStartInlineResult } from './onDragStartInlineResult';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';
import { useCodeLineClickReference } from './useCodeLineClickReference';

export const CodeLine: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_CODE_LINE);

  const selected = useSelected();
  const codeLineContent = useNodeText(element, { debounceTimeMs: 0 }) ?? '';
  const isEmpty = !codeLineContent.trim() && element.children.length <= 1;

  const siblingCodeLines = useEditorChangeState(
    (editor) => ({
      hasNext:
        getNextNode<MyElement>(editor, {
          at: ReactEditor.findPath(editor as ReactEditor, element),
          match: isElement,
        })?.[0]?.type === ELEMENT_CODE_LINE,
      hasPrevious:
        getPreviousNode<MyElement>(editor, {
          at: ReactEditor.findPath(editor as ReactEditor, element),
          match: isElement,
        })?.[0]?.type === ELEMENT_CODE_LINE,
    }),
    { hasNext: false, hasPrevious: false }
  );

  const editor = useTEditorRef();
  useCodeLineClickReference(editor, selected, codeLineContent);

  const computer = useComputer();
  const { id: lineId } = element;
  const [syntaxError, lineResult] = computer.getBlockIdResult$.useWithSelector(
    (line) => [getSyntaxError(line), line?.result] as const,
    lineId
  );

  const onClickedResult = useCallback(
    (result: Result.Result) => {
      if (
        result.type.kind !== 'number' &&
        result.type.kind !== 'date' &&
        result.type.kind !== 'string' &&
        result.type.kind !== 'boolean'
      ) {
        return;
      }

      const path = findNodePath(editor, element);
      if (!path) {
        return;
      }

      const newDisplayElement: DisplayElement = {
        id: nanoid(),
        type: ELEMENT_DISPLAY,
        blockId: element.id,
        children: [{ text: '' }],
      };

      insertNodes(editor, newDisplayElement, {
        at: [path[0] + 1],
      });
    },
    [editor, element]
  );

  return (
    <DraggableBlock
      blockKind="codeLine"
      element={element}
      {...attributes}
      id={lineId}
    >
      <UICodeLine
        highlight={selected}
        result={lineResult}
        placeholder="Distance = 60 km/h * Time"
        syntaxError={syntaxError}
        isEmpty={isEmpty}
        onDragStartInlineResult={onDragStartInlineResult(editor, { element })}
        onDragStartCell={onDragStartTableCellResult(editor)}
        onClickedResult={onClickedResult}
        hasNextSibling={siblingCodeLines?.hasNext}
        hasPreviousSibling={siblingCodeLines?.hasPrevious}
      >
        {children}
      </UICodeLine>
    </DraggableBlock>
  );
};
