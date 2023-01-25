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
  useNodeText,
} from '@decipad/editor-utils';
import {
  useComputer,
  useEditorTeleportContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { CodeLine as UICodeLine } from '@decipad/ui';
import { findNodePath } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { useSelected } from 'slate-react';
import { useCallback, useMemo } from 'react';
import { DraggableBlock } from '../block-management';
import { CodeLineTeleport } from './CodeLineTeleport';
import { getSyntaxError } from './getSyntaxError';
import { onDragStartInlineResult } from './onDragStartInlineResult';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';
import { useCodeLineClickReference } from './useCodeLineClickReference';
import { useSiblingCodeLines } from './useSiblingCodeLines';
import { useOnBlurNormalize } from '../hooks';
import { useTurnIntoProps } from './useTurnIntoProps';

export const CodeLine: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_CODE_LINE);

  const selected = useSelected();
  const codeLineContent = useNodeText(element, { debounceTimeMs: 0 }) ?? '';
  const isEmpty = !codeLineContent.trim() && element.children.length <= 1;

  const siblingCodeLines = useSiblingCodeLines(element);

  const editor = useTEditorRef();

  useCodeLineClickReference(editor, selected, codeLineContent);

  // transform variable references into smart refs on blur
  useOnBlurNormalize(editor, element);

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

  const isReadOnly = useIsEditorReadOnly();

  const handleDragStartCell = useMemo(
    () =>
      isReadOnly
        ? undefined
        : onDragStartTableCellResult(editor, {
            computer,
          }),
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

  const isNameUsed = computer.isInUse$.use(lineId);

  return (
    <DraggableBlock
      blockKind="codeLine"
      element={element}
      {...turnIntoProps}
      {...attributes}
      onDelete={isNameUsed ? 'name-used' : undefined}
      id={lineId}
      hasPreviousSibling={siblingCodeLines?.hasPrevious}
    >
      <CodeLineTeleport
        codeLine={teleport}
        onDismiss={onTeleportDismiss}
        onBringBack={focusCodeLine}
      >
        <UICodeLine
          highlight={selected}
          result={lineResult}
          placeholder="Distance = 60 km/h * Time"
          syntaxError={syntaxError}
          isEmpty={isEmpty}
          onDragStartInlineResult={handleDragStartInlineResult}
          onDragStartCell={handleDragStartCell}
          onClickedResult={isReadOnly ? undefined : onClickedResult}
          hasNextSibling={!teleport && siblingCodeLines?.hasNext}
          hasPreviousSibling={!teleport && siblingCodeLines?.hasPrevious}
        >
          {children}
        </UICodeLine>
      </CodeLineTeleport>
    </DraggableBlock>
  );
};
