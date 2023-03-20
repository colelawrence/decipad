import { Result } from '@decipad/computer';
import {
  DisplayElement,
  ELEMENT_CODE_LINE,
  ELEMENT_DISPLAY,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  insertNodes,
  placeholderForCalculationLine,
  useNodeText,
} from '@decipad/editor-utils';
import {
  useComputer,
  useEditorTeleportContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { CodeLine as UICodeLine, ParagraphFormulaEditor } from '@decipad/ui';
import { findNodePath } from '@udecode/plate';
import { Formula } from 'libs/ui/src/icons';
import { codeBlock } from 'libs/ui/src/styles';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelected } from 'slate-react';
import { DraggableBlock } from '../block-management';
import { useOnDragEnd } from '../utils/useDnd';
import { CodeLineTeleport } from './CodeLineTeleport';
import { getSyntaxError } from './getSyntaxError';
import { onDragStartInlineResult } from './onDragStartInlineResult';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';
import { useCodeLineClickReference } from './useCodeLineClickReference';
import { useSiblingCodeLines } from './useSiblingCodeLines';
import { useTurnIntoProps } from './useTurnIntoProps';
import { useAutoConvertToSmartRef } from './useAutoConvertToSmartRef';

export const CodeLine: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_CODE_LINE);

  const selected = useSelected();
  const codeLineContent = useNodeText(element, { debounceTimeMs: 0 }) ?? '';
  const isEmpty = !codeLineContent.trim() && element.children.length <= 1;

  const siblingCodeLines = useSiblingCodeLines(element);

  const editor = useTEditorRef();
  const computer = useComputer();

  useCodeLineClickReference(editor, selected, codeLineContent);

  useAutoConvertToSmartRef(element);

  const { id: lineId } = element;
  const [syntaxError, lineResult] = computer.getBlockIdResult$.useWithSelector(
    (line) => [getSyntaxError(line), line?.result] as const,
    lineId
  );

  useEffect(() => {
    // refresh decorations when text or result type changes
    const path = findNodePath(editor, element);
    if (path) {
      editor.normalizeNode([element, path]);
    }
  }, [editor, element, lineResult?.type]);

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

  const isReadOnly = useIsEditorReadOnly();

  const handleDragStartCell = useMemo(
    () =>
      isReadOnly ? undefined : onDragStartTableCellResult(editor, { computer }),
    [computer, editor, isReadOnly]
  );

  const handleDragStartInlineResult = useMemo(
    () =>
      isReadOnly
        ? undefined
        : onDragStartInlineResult(editor, {
            element,
            computer,
            result: lineResult as Result.Result,
          }),
    [computer, editor, element, isReadOnly, lineResult]
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

  useWatchTeleported(lineId, element);

  const teleport = editing?.codeLineId === element.id ? portal : undefined;

  const turnIntoProps = useTurnIntoProps(element, computer, lineId);

  const onTeleportDismiss = useCallback(() => {
    closeEditor(element.id, focusNumber);
  }, [focusNumber, closeEditor, element.id]);

  const [aPlaceholder] = useState(placeholderForCalculationLine());

  const isPortalVisible = teleport != null && portal != null;

  return (
    <DraggableBlock
      blockKind="codeLine"
      element={element}
      {...turnIntoProps}
      {...attributes}
      dependencyId={lineId}
      id={lineId}
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
            hasNextSibling={!teleport && siblingCodeLines?.hasNext}
            hasPreviousSibling={!teleport && siblingCodeLines?.hasPrevious}
          >
            {children}
          </UICodeLine>
        )}
      </CodeLineTeleport>
    </DraggableBlock>
  );
};
