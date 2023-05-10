import type {
  IdentifiedError,
  IdentifiedResult,
  Result,
  SimpleValue,
} from '@decipad/computer';
import {
  CodeLineV2Element,
  DisplayElement,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DISPLAY,
  ELEMENT_STRUCTURED_VARNAME,
  MyElement,
  PlateComponent,
  useTEditorRef,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  getCodeLineSource,
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
  ParagraphFormulaEditor,
  StructuredInputUnits,
  Tooltip,
} from '@decipad/ui';
import {
  findNodePath,
  getNodeString,
  getPreviousNode,
  useElement,
  useEventEditorSelectors,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import {
  Children,
  createContext,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSelected } from 'slate-react';
import { css } from '@emotion/react';
import {
  focusMouseEventLocation,
  shouldResetContentEditable,
} from '@decipad/ui/src/molecules/CodeVariableDefinition/CodeVariableDefinition';
import { DraggableBlock } from '../block-management';
import { BlockLengthSynchronizationReceiver } from '../BlockLengthSynchronization/BlockLengthSynchronizationReceiver';
import { CodeLineTeleport } from './CodeLineTeleport';
import { getSyntaxError } from './getSyntaxError';
import { onDragStartInlineResult } from './onDragStartInlineResult';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';
import { useCodeLineClickReference } from './useCodeLineClickReference';
import { useSimpleValueInfo } from './useSimpleValueInfo';
import { useTurnIntoProps } from './useTurnIntoProps';
import { useAutoConvertToSmartRef } from './useAutoConvertToSmartRef';
import { CodeVariableDefinitionEffects } from './CodeVariableDefinitionEffects';

export type Variant = 'error' | 'calculation' | 'value';

const codeLineDebounceResultMs = 500;

export const CodeLineV2: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_CODE_LINE_V2);

  const computer = useComputer();
  const editor = useTEditorRef();
  const sourceCode = getCodeLineSource(element.children[1]);

  useAutoConvertToSmartRef(element);

  const { simpleValue, onChangeUnit } = useSimpleValueInfo(
    computer,
    element,
    sourceCode
  );

  const selected = useSelected();
  const codeLineContent = useNodeText(element, { debounceTimeMs: 0 }) ?? '';
  useCodeLineClickReference(editor, selected, codeLineContent);

  const { id: lineId } = element;
  const [syntaxError, lineResult] =
    computer.getBlockIdResult$.useWithSelectorDebounced(
      codeLineDebounceResultMs,
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
            result: lineResult?.result as any,
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

  const isPortalVisible = teleport != null && portal != null;

  const unitPicker = simpleValue != null && (
    <StructuredInputUnits
      unit={simpleValue.unit}
      onChangeUnit={onChangeUnit}
      readOnly={isReadOnly}
    />
  );

  const varNameElem = (
    <SimpleValueContext.Provider value={simpleValue}>
      <VarResultContext.Provider value={lineResult}>
        {childrenArray[0]}
      </VarResultContext.Provider>
    </SimpleValueContext.Provider>
  );

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
        {isPortalVisible ? (
          <ParagraphFormulaEditor
            type={simpleValue ? 'input' : 'formula'}
            varName={varNameElem}
            formula={childrenArray[1]}
            units={unitPicker}
          />
        ) : (
          <CodeLineStructured
            highlight={selected}
            result={lineResult?.result}
            syntaxError={syntaxError}
            onDragStartInlineResult={handleDragStartInlineResult}
            onDragStartCell={handleDragStartCell}
            onClickedResult={isReadOnly ? undefined : onClickedResult}
            variableNameChild={varNameElem}
            codeChild={childrenArray[1]}
            unitPicker={unitPicker}
            readOnly={isReadOnly}
          />
        )}
      </CodeLineTeleport>
    </DraggableBlock>
  );
};

export const VarResultContext = createContext<
  IdentifiedResult | IdentifiedError | undefined
>(undefined);

export const SimpleValueContext = createContext<SimpleValue | undefined>(
  undefined
);

export const CodeLineV2Varname: PlateComponent = (props) => {
  assertElementType(props.element, ELEMENT_STRUCTURED_VARNAME);

  const [contentEditable, setContentEditable] = useState(false);
  const element = useElement<CodeLineV2Element>(ELEMENT_CODE_LINE_V2);
  const editor = useTPlateEditorRef();
  const computer = useComputer();
  const varResult = useContext(VarResultContext);
  const simpleValue = useContext(SimpleValueContext);
  const isReadOnly = useIsEditorReadOnly();

  const { id: lineId } = element;
  const lineResult = computer.getBlockIdResult$.use(lineId);

  const errorMessage = useEnsureValidVariableName(props.element, [
    varResult?.id,
  ]);
  const empty = getNodeString(props.element).trim() === '';

  const blurred = useEventEditorSelectors.blur();
  useEffect(() => {
    if (blurred) {
      setContentEditable(false);
    }
  }, [blurred]);

  const handleDragStartInlineResult = useMemo(
    () =>
      isReadOnly
        ? undefined
        : onDragStartInlineResult(editor, {
            element,
            computer,
            result: lineResult?.result as any,
          }),
    [computer, editor, element, isReadOnly, lineResult]
  );

  const onEditorChange = useCallback(() => {
    const shouldReset = shouldResetContentEditable(
      editor,
      props.element.id as string,
      contentEditable
    );
    if (shouldReset !== null) {
      setContentEditable(shouldReset);
    }
  }, [contentEditable, editor, props.element.id, setContentEditable]);

  const handleCodeVariableDefinitionClick = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      setContentEditable(true);
      focusMouseEventLocation(editor, element, event);
    },
    [editor, element]
  );

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
              isValue={simpleValue != null}
              contentEditable={contentEditable}
              readOnly={isReadOnly}
              onClick={handleCodeVariableDefinitionClick}
              onDragStartInlineResult={handleDragStartInlineResult}
            >
              <CodeVariableDefinitionEffects onEditorChange={onEditorChange} />
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

const avoidUnclickableZeroWidth = css({ paddingRight: '20px' });

export const CodeLineV2Code: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_CODE_LINE_V2_CODE);

  // transform variable references into smart refs on blur
  useAutoConvertToSmartRef(element);

  const isEmpty = getCodeLineSource(element) === '';

  return (
    <span {...attributes} css={isEmpty && avoidUnclickableZeroWidth}>
      {children}
    </span>
  );
};
