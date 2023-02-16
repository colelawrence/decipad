import {
  IdentifiedError,
  IdentifiedResult,
  isValue as isCodeValue,
  parseExpressionOrThrow,
  Result,
} from '@decipad/computer';
import {
  DisplayElement,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DISPLAY,
  ELEMENT_STRUCTURED_VARNAME,
  MyElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  insertNodes,
  isStructuredElement,
  useEnsureValidVariableName,
  useNodeText,
} from '@decipad/editor-utils';
import {
  useComputer,
  useEditorTeleportContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import {
  CodeLineStructured,
  CodeVariableDefinition,
  Tooltip,
} from '@decipad/ui';
import { findNodePath, getNodeString, getPreviousNode } from '@udecode/plate';
import { dequal } from 'dequal';
import { nanoid } from 'nanoid';
import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';
import { useSelected } from 'slate-react';
import { DraggableBlock } from '../block-management';
import { BlockLengthSynchronizationReceiver } from '../BlockLengthSynchronization/BlockLengthSynchronizationReceiver';
import { useOnBlurNormalize } from '../hooks';
import { CodeLineTeleport } from './CodeLineTeleport';
import { getSyntaxError } from './getSyntaxError';
import { onDragStartInlineResult } from './onDragStartInlineResult';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';
import { useCodeLineClickReference } from './useCodeLineClickReference';
import { useTurnIntoProps } from './useTurnIntoProps';

export const CodeLineV2: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_CODE_LINE_V2);

  const sourceCode = getNodeString(element.children[1]);

  const subValue = useRef(new Subject<boolean>());
  const [isValue, setIsValue] = useState(isCodeValue(sourceCode));

  useEffect(() => {
    try {
      parseExpressionOrThrow(sourceCode);
      subValue.current.next(isCodeValue(sourceCode));
    } catch (e) {
      // do nothing
    }
  }, [sourceCode]);

  useEffect(() => {
    subValue.current
      .pipe(debounceTime(0), distinctUntilChanged(dequal))
      .subscribe(setIsValue);
  }, []);

  const selected = useSelected();
  const codeLineContent = useNodeText(element, { debounceTimeMs: 0 }) ?? '';

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
            result: lineResult as any,
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

  const childrenArray = Children.toArray(children);
  if (childrenArray.length !== 2) {
    throw new Error('panic: expected only 2 children');
  }

  const path = findNodePath(editor, element);
  const prevElement = getPreviousNode<MyElement>(editor, { at: path });

  return (
    <DraggableBlock
      blockKind="structured"
      element={element}
      {...turnIntoProps}
      {...attributes}
      dependencyId={lineId}
      id={lineId}
      isCentered={true}
      hasPreviousSibling={isStructuredElement(prevElement?.[0])}
    >
      <CodeLineTeleport
        codeLine={teleport}
        onDismiss={onTeleportDismiss}
        onBringBack={focusCodeLine}
      >
        <CodeLineStructured
          highlight={selected}
          result={lineResult?.result}
          syntaxError={syntaxError}
          onDragStartInlineResult={handleDragStartInlineResult}
          onDragStartCell={handleDragStartCell}
          onClickedResult={isReadOnly ? undefined : onClickedResult}
          variableNameChild={
            <IsValueContext.Provider value={isValue}>
              <VarResultContext.Provider value={lineResult}>
                {childrenArray[0]}
              </VarResultContext.Provider>
            </IsValueContext.Provider>
          }
          codeChild={childrenArray[1]}
        />
      </CodeLineTeleport>
    </DraggableBlock>
  );
};

export const VarResultContext = createContext<
  IdentifiedResult | IdentifiedError | undefined
>(undefined);

export const IsValueContext = createContext<boolean>(true);

export const CodeLineV2Varname: PlateComponent = (props) => {
  assertElementType(props.element, ELEMENT_STRUCTURED_VARNAME);

  const varResult = useContext(VarResultContext);
  const isValue = useContext(IsValueContext);

  const errorMessage = useEnsureValidVariableName(props.element, varResult?.id);
  const empty = getNodeString(props.element).trim() === '';

  return (
    <Tooltip
      trigger={
        <span
          {...props.attributes}
          data-testid="codeline-varname"
          spellCheck={false}
        >
          <BlockLengthSynchronizationReceiver
            syncGroupName="variableNameColumn"
            topLevelBlockId={varResult?.id}
          >
            <CodeVariableDefinition
              empty={empty}
              type={
                varResult?.type === 'identified-error'
                  ? { kind: 'number', unit: null }
                  : varResult?.result.type
              }
              isValue={isValue}
            >
              {props.children}
            </CodeVariableDefinition>
          </BlockLengthSynchronizationReceiver>
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
