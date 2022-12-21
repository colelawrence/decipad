import {
  PlateComponent,
  DisplayElement,
  ELEMENT_DISPLAY,
  useTEditorRef,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_VARNAME,
  ELEMENT_CODE_LINE_V2_CODE,
} from '@decipad/editor-types';
import { Result, SerializedType } from '@decipad/computer';
import { assertElementType, useNodeText } from '@decipad/editor-utils';
import {
  useComputer,
  useIsEditorReadOnly,
  useEditorTeleportContext,
} from '@decipad/react-contexts';
import { CodeLine as UICodeLine, CodeVariableDefinition } from '@decipad/ui';
import { findNodePath, getNodeString, insertNodes } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { useSelected } from 'slate-react';
import {
  Children,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { DraggableBlock } from '../block-management';
import { getSyntaxError } from './getSyntaxError';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';
import { useCodeLineClickReference } from './useCodeLineClickReference';
import { useSiblingCodeLines } from './useSiblingCodeLines';
import { useOnBlurNormalize } from '../hooks';
import { useTurnIntoProps } from '../utils';
import { CodeLineTeleport } from './CodeLineTeleport';

export const CodeLineV2: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_CODE_LINE_V2);

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
    () => (isReadOnly ? undefined : onDragStartTableCellResult(editor)),
    [editor, isReadOnly]
  );

  /* TODO
  const handleDragStartInlineResult = useMemo(
    () =>
      isReadOnly ? undefined : onDragStartInlineResult(editor, { element }),
    [editor, element, isReadOnly]
  );
  */

  const { closeEditor, focusNumber, portal, editing, useWatchTeleported } =
    useEditorTeleportContext();

  useWatchTeleported(lineId, element);

  const teleport = editing?.codeLineId === element.id ? portal : undefined;

  const turnIntoProps = useTurnIntoProps(element);

  const onTeleportDismiss = useCallback(() => {
    closeEditor(element.id, () => {
      focusNumber();
    });
  }, [focusNumber, closeEditor, element.id]);

  const childrenArray = Children.toArray(children);
  if (childrenArray.length !== 2) {
    throw new Error('panic: expected only 2 children');
  }

  return (
    <DraggableBlock
      blockKind="codeLine"
      element={element}
      {...turnIntoProps}
      {...attributes}
      id={lineId}
    >
      <CodeLineTeleport codeLine={teleport} onDismiss={onTeleportDismiss}>
        <UICodeLine
          highlight={selected}
          result={lineResult}
          placeholder="Distance = 60 km/h * Time"
          syntaxError={syntaxError}
          isEmpty={isEmpty}
          /* onDragStartInlineResult={handleDragStartInlineResult} */
          onDragStartCell={handleDragStartCell}
          onClickedResult={isReadOnly ? undefined : onClickedResult}
          hasNextSibling={!teleport && siblingCodeLines?.hasNext}
          hasPreviousSibling={!teleport && siblingCodeLines?.hasPrevious}
        >
          <VarTypeContext.Provider value={lineResult?.type}>
            <span>{childrenArray[0]}</span>
          </VarTypeContext.Provider>

          <span contentEditable={false} css={{ userSelect: 'none' }}>
            {' = '}
          </span>
          <span>{childrenArray[1]}</span>
        </UICodeLine>
      </CodeLineTeleport>
    </DraggableBlock>
  );
};

const VarTypeContext = createContext<SerializedType | undefined>(undefined);

export const CodeLineV2Varname: PlateComponent = (props) => {
  assertElementType(props.element, ELEMENT_CODE_LINE_V2_VARNAME);
  const type = useContext(VarTypeContext);

  const contents = getNodeString(props.element);

  const empty = contents.trim() === '';
  return (
    <span {...props.attributes}>
      <CodeVariableDefinition empty={empty} type={type}>
        {props.children}
      </CodeVariableDefinition>
    </span>
  );
};

export const CodeLineV2Code: PlateComponent = (props) => {
  assertElementType(props.element, ELEMENT_CODE_LINE_V2_CODE);

  return <span {...props.attributes}>{props.children}</span>;
};
