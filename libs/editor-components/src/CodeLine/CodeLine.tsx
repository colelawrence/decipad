import { useComputer, useNodeText } from '@decipad/editor-hooks';
import type { Result } from '@decipad/language-interfaces';
import type { DisplayElement, PlateComponent } from '@decipad/editor-types';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_DISPLAY,
  useMyEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  insertNodes,
  placeholderForCalculationLine,
} from '@decipad/editor-utils';
import {
  useInsideLayoutContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { CodeLine as UICodeLine } from '@decipad/ui';
import { findNodePath } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { useCallback, useMemo, useState } from 'react';
import { useSelected } from 'slate-react';
import { DraggableBlock } from '../block-management';
import { useOnDragEnd } from '../utils/useDnd';
import { getSyntaxError } from './getSyntaxError';
import { onDragStartInlineResult } from './onDragStartInlineResult';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';
import { useAutoConvertToSmartRef } from './useAutoConvertToSmartRef';
import { useCodeLineClickReference } from './useCodeLineClickReference';
import { useSiblingCodeLines } from './useSiblingCodeLines';

const codeLineDebounceResultMs = 500;

export const CodeLine: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_CODE_LINE);

  const selected = useSelected();
  const codeLineContent = useNodeText(element, { debounceTimeMs: 0 }) ?? '';
  const isEmpty = !codeLineContent.trim() && element.children.length <= 1;

  const siblingCodeLines = useSiblingCodeLines(element);

  const editor = useMyEditorRef();
  const computer = useComputer();
  const insideLayout = useInsideLayoutContext();

  useCodeLineClickReference(editor, selected, codeLineContent);

  useAutoConvertToSmartRef(element);

  const { id: lineId } = element;
  const [syntaxError, lineResult] =
    computer.getBlockIdResult$.useWithSelectorDebounced(
      codeLineDebounceResultMs,
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

      insertNodes(editor, [newDisplayElement], {
        at: [path[0] + 1],
      });
    },
    [editor, element]
  );

  const isReadOnly = useIsEditorReadOnly();

  const handleDragStartCell = useMemo(
    () => (isReadOnly ? undefined : onDragStartTableCellResult(editor)),
    [editor, isReadOnly]
  );

  const handleDragStartInlineResult = useMemo(
    () =>
      isReadOnly
        ? undefined
        : onDragStartInlineResult(editor, {
            element,
            result: lineResult as Result.Result,
          }),
    [editor, element, isReadOnly, lineResult]
  );

  const onDragEnd = useOnDragEnd();

  const [aPlaceholder] = useState(placeholderForCalculationLine);

  return (
    <DraggableBlock
      blockKind="codeLine"
      element={element}
      {...attributes}
      dependencyId={lineId}
      hasPreviousSibling={siblingCodeLines?.hasPrevious}
    >
      <UICodeLine
        highlight={selected}
        result={lineResult}
        placeholder={aPlaceholder}
        syntaxError={syntaxError}
        isEmpty={isEmpty}
        onDragStartInlineResult={handleDragStartInlineResult}
        onDragStartCell={handleDragStartCell}
        onDragEnd={onDragEnd}
        onClickedResult={isReadOnly ? undefined : onClickedResult}
        hasNextSibling={!insideLayout && siblingCodeLines?.hasNext}
        hasPreviousSibling={!insideLayout && siblingCodeLines?.hasPrevious}
        insideLayout={insideLayout}
        element={element}
      >
        {children}
      </UICodeLine>
    </DraggableBlock>
  );
};
