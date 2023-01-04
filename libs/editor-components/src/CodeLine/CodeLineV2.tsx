import { IdentifiedError, IdentifiedResult, Result } from '@decipad/computer';
import {
  DisplayElement,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_CODE_LINE_V2_VARNAME,
  ELEMENT_DISPLAY,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useNodeText,
  insertNodes,
  useEnsureValidVariableName,
} from '@decipad/editor-utils';
import {
  useComputer,
  useIsEditorReadOnly,
  useEditorTeleportContext,
} from '@decipad/react-contexts';
import {
  CodeLineStructured,
  CodeVariableDefinition,
  Tooltip,
} from '@decipad/ui';
import { findNodePath, getNodeString } from '@udecode/plate';
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
import { CodeLineTeleport } from './CodeLineTeleport';
import { getSyntaxError } from './getSyntaxError';
import { onDragStartInlineResult } from './onDragStartInlineResult';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';
import { useCodeLineClickReference } from './useCodeLineClickReference';
import { useSiblingCodeLines } from './useSiblingCodeLines';
import { useOnBlurNormalize } from '../hooks';
import { useTurnIntoProps } from './useTurnIntoProps';

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
    (line) => [getSyntaxError(line), line] as const,
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

  const childrenArray = Children.toArray(children);
  if (childrenArray.length !== 2) {
    throw new Error('panic: expected only 2 children');
  }

  const isNameUsed = computer.getIsVariableUsed$.use(
    element.id,
    getNodeString(element.children[0])
  );

  return (
    <DraggableBlock
      blockKind="codeLine"
      element={element}
      {...turnIntoProps}
      {...attributes}
      onDelete={isNameUsed ? 'name-used' : undefined}
      id={lineId}
    >
      <CodeLineTeleport
        codeLine={teleport}
        onDismiss={onTeleportDismiss}
        onBringBack={focusCodeLine}
      >
        <CodeLineStructured
          highlight={selected}
          result={lineResult?.result}
          placeholder="Distance = 60 km/h * Time"
          syntaxError={syntaxError}
          isEmpty={isEmpty}
          onDragStartInlineResult={handleDragStartInlineResult}
          onDragStartCell={handleDragStartCell}
          onClickedResult={isReadOnly ? undefined : onClickedResult}
          hasNextSibling={!teleport && siblingCodeLines?.hasNext}
          variableNameChild={
            <VarResultContext.Provider value={lineResult}>
              {childrenArray[0]}
            </VarResultContext.Provider>
          }
          codeChild={childrenArray[1]}
        />
      </CodeLineTeleport>
    </DraggableBlock>
  );
};

const VarResultContext = createContext<
  IdentifiedResult | IdentifiedError | undefined
>(undefined);

export const CodeLineV2Varname: PlateComponent = (props) => {
  assertElementType(props.element, ELEMENT_CODE_LINE_V2_VARNAME);

  const varResult = useContext(VarResultContext);

  const errorMessage = useEnsureValidVariableName(props.element, varResult?.id);

  const empty = getNodeString(props.element).trim() === '';

  return (
    <Tooltip
      trigger={
        <span {...props.attributes} data-testid="codeline-varname">
          <CodeVariableDefinition
            empty={empty}
            type={{ kind: 'table-formula' }}
          >
            {props.children}
          </CodeVariableDefinition>
        </span>
      }
      open={errorMessage != null}
    >
      {errorMessage}
    </Tooltip>
  );
};

export const CodeLineV2Code: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_CODE_LINE_V2_CODE);

  const editor = useTEditorRef();

  // transform variable references into smart refs on blur
  useOnBlurNormalize(editor, element);

  return <span {...attributes}>{children}</span>;
};
