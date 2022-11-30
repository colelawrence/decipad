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
  useNodeText,
  useElementMutatorCallback,
  focusAndSetSelection,
} from '@decipad/editor-utils';
import {
  useComputer,
  useIsEditorReadOnly,
  useEditorBubblesContext,
} from '@decipad/react-contexts';
import { CodeLine as UICodeLine } from '@decipad/ui';
import { findNodePath, insertNodes } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { ReactEditor, useSelected } from 'slate-react';
import { useCallback, useMemo } from 'react';
import { DraggableBlock } from '../block-management';
import { CodeLineTeleport } from './CodeLineTeleport';
import { getSyntaxError } from './getSyntaxError';
import { onDragStartInlineResult } from './onDragStartInlineResult';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';
import { useCodeLineClickReference } from './useCodeLineClickReference';
import { useSiblingCodeLines } from './useSiblingCodeLines';
import { useOnBlurNormalize } from '../hooks';
import { useTurnIntoProps } from '../utils';

export const CodeLine: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_CODE_LINE);

  const selected = useSelected();
  const codeLineContent = useNodeText(element, { debounceTimeMs: 0 }) ?? '';
  const isEmpty = !codeLineContent.trim() && element.children.length <= 1;

  const siblingCodeLines = useSiblingCodeLines(element);

  const editor = useTEditorRef();
  const setUnpinned = useElementMutatorCallback(editor, element, 'isUnpinned');

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
    () => (isReadOnly ? undefined : onDragStartTableCellResult(editor)),
    [editor, isReadOnly]
  );

  const handleDragStartInlineResult = useMemo(
    () =>
      isReadOnly ? undefined : onDragStartInlineResult(editor, { element }),
    [editor, element, isReadOnly]
  );

  const { closeEditor, portal, editing } = useEditorBubblesContext();

  const teleport = editing?.codeLineId === element.id ? portal : undefined;

  const draggableBlockStyle = element.isUnpinned
    ? { display: 'none' }
    : undefined;

  const turnIntoProps = useTurnIntoProps(element);

  const onPinButtonClick = useCallback(() => {
    setUnpinned(!element.isUnpinned);
    closeEditor();
  }, [setUnpinned, closeEditor, element.isUnpinned]);

  const onTeleport = useCallback(() => {
    const currentPath = ReactEditor.findPath(editor as ReactEditor, element);
    focusAndSetSelection(editor, currentPath);
  }, [editor, element]);

  const onCodeTeleportBlur = useCallback(() => {
    closeEditor(element.id);
  }, [closeEditor, element.id]);

  return (
    <DraggableBlock
      blockKind="codeLine"
      element={element}
      {...turnIntoProps}
      {...attributes}
      id={lineId}
      css={draggableBlockStyle}
    >
      <CodeLineTeleport
        codeLine={teleport}
        onBlur={onCodeTeleportBlur}
        onTeleport={onTeleport}
      >
        <UICodeLine
          highlight={selected}
          result={lineResult}
          placeholder="Distance = 60 km/h * Time"
          syntaxError={syntaxError}
          isEmpty={isEmpty}
          isUnpinned={element.isUnpinned}
          onPinButtonClick={onPinButtonClick}
          isEditable={teleport != null || !element.isUnpinned}
          onDragStartInlineResult={handleDragStartInlineResult}
          onDragStartCell={handleDragStartCell}
          onClickedResult={isReadOnly ? undefined : onClickedResult}
          hasNextSibling={siblingCodeLines?.hasNext}
          hasPreviousSibling={siblingCodeLines?.hasPrevious}
        >
          {children}
        </UICodeLine>
      </CodeLineTeleport>
    </DraggableBlock>
  );
};
