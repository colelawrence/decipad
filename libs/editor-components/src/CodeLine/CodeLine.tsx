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
  useEditorTeleportContext,
  useInsideLayoutContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { ParagraphFormulaEditor, CodeLine as UICodeLine } from '@decipad/ui';
import { findNodePath } from '@udecode/plate-common';
import { Formula } from 'libs/ui/src/icons';
import { codeBlock } from 'libs/ui/src/styles';
import { nanoid } from 'nanoid';
import { useCallback, useMemo, useState } from 'react';
import { useSelected } from 'slate-react';
import { DraggableBlock } from '../block-management';
import { useOnDragEnd } from '../utils/useDnd';
import { CodeLineTeleport } from './CodeLineTeleport';
import { getSyntaxError } from './getSyntaxError';
import { onDragStartInlineResult } from './onDragStartInlineResult';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';
import { useAutoConvertToSmartRef } from './useAutoConvertToSmartRef';
import { useCodeLineClickReference } from './useCodeLineClickReference';
import { useSiblingCodeLines } from './useSiblingCodeLines';
import { useTurnIntoProps } from './useTurnIntoProps';

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
        blockId: element.id ?? '',
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

  const {
    closeEditor,
    focusNumber,
    focusCodeLine,
    portal,
    editing,
    useWatchTeleported,
  } = useEditorTeleportContext();

  useWatchTeleported(lineId ?? '', element);

  const teleport = editing?.codeLineId === element.id ? portal : undefined;

  const turnIntoProps = useTurnIntoProps(element, computer, lineId ?? '');

  const onTeleportDismiss = useCallback(() => {
    closeEditor(element.id, focusNumber);
  }, [focusNumber, closeEditor, element.id]);

  const [aPlaceholder] = useState(placeholderForCalculationLine);

  const isPortalVisible = teleport != null && portal != null;

  return (
    <DraggableBlock
      blockKind="codeLine"
      element={element}
      {...turnIntoProps}
      {...attributes}
      dependencyId={lineId}
      hasPreviousSibling={siblingCodeLines?.hasPrevious}
    >
      <CodeLineTeleport
        codeLine={teleport}
        onDismiss={onTeleportDismiss}
        onBringBack={focusCodeLine}
      >
        {isPortalVisible ? (
          <ParagraphFormulaEditor
            formula={children}
            varName={
              <div css={codeBlock.pAdvCalcStyles}>
                <span css={codeBlock.pIconStyles}>
                  <Formula />
                </span>
                <span>Formula</span>
              </div>
            }
          />
        ) : (
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
            hasNextSibling={
              !teleport && !insideLayout && siblingCodeLines?.hasNext
            }
            hasPreviousSibling={
              !teleport && !insideLayout && siblingCodeLines?.hasPrevious
            }
            insideLayout={insideLayout}
            element={element}
          >
            {children}
          </UICodeLine>
        )}
      </CodeLineTeleport>
    </DraggableBlock>
  );
};
