import {
  useComputer,
  useEnsureValidVariableName,
  useGeneratedName,
  useNodePath,
  useNodeText,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import type {
  CodeLineV2Element,
  MyElement,
  PlateComponent,
} from '@decipad/editor-types';
import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  useMyEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  getCodeLineSource,
  isStructuredElement,
} from '@decipad/editor-utils';
import {
  useEditorTeleportContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import type {
  IdentifiedError,
  IdentifiedResult,
  SimpleValue,
} from '@decipad/remote-computer';
import {
  CodeLineStructured,
  CodeVariableDefinition,
  ParagraphFormulaEditor,
  StructuredInputUnits,
  Tooltip,
  focusMouseEventLocation,
  shouldResetContentEditable,
} from '@decipad/ui';
import { css } from '@emotion/react';
import {
  findNodePath,
  getNodeString,
  getPreviousNode,
  insertText,
  isElement,
  useElement,
  useEventEditorSelectors,
} from '@udecode/plate-common';
import type { MouseEvent } from 'react';
import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSelected } from 'slate-react';
import { BlockLengthSynchronizationReceiver } from '../BlockLengthSynchronization/BlockLengthSynchronizationReceiver';
import { DraggableBlock } from '../block-management';
import { CodeLineTeleport } from './CodeLineTeleport';
import { CodeVariableDefinitionEffects } from './CodeVariableDefinitionEffects';
import { getSyntaxError } from './getSyntaxError';
import { onDragStartInlineResult } from './onDragStartInlineResult';
import { onDragStartTableCellResult } from './onDragStartTableCellResult';
import { useAutoConvertToSmartRef } from './useAutoConvertToSmartRef';
import { useCodeLineClickReference } from './useCodeLineClickReference';
import { useSimpleValueInfo } from './useSimpleValueInfo';
import { useTurnIntoProps } from './useTurnIntoProps';

export type Variant = 'error' | 'calculation' | 'value';

const codeLineDebounceResultMs = 500;

export const CodeLineV2: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_CODE_LINE_V2);

  const computer = useComputer();
  const editor = useMyEditorRef();
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
            result: lineResult?.result as any,
          }),
    [editor, element, isReadOnly, lineResult]
  );

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

  const childrenArray = Children.toArray(children);
  if (childrenArray.length !== 2) {
    throw new Error('panic: expected only 2 children');
  }

  const path = findNodePath(editor, element);
  const prevElement = getPreviousNode<MyElement>(editor, { at: path });

  const isPortalVisible = teleport != null && portal != null;

  const setShowResult = usePathMutatorCallback<CodeLineV2Element, 'showResult'>(
    editor,
    path,
    'showResult',
    'CodeLineV2'
  );

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
            variableNameChild={varNameElem}
            codeChild={childrenArray[1]}
            unitPicker={unitPicker}
            readOnly={isReadOnly}
            showResult={element.showResult}
            setShowResult={setShowResult}
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
  const editor = useMyEditorRef();
  const computer = useComputer();
  const varResult = useContext(VarResultContext);
  const simpleValue = useContext(SimpleValueContext);
  const isReadOnly = useIsEditorReadOnly();
  const path = useNodePath(props.element);

  const setLabel = useCallback(
    (newOption: string) => {
      insertText(editor, newOption, {
        at: path,
      });
    },
    [editor, path]
  );

  const { generate, cancel } = useGeneratedName({
    element: props.element,
    setLabel,
  });

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
            result: lineResult?.result as any,
          }),
    [editor, element, isReadOnly, lineResult]
  );

  const onEditorChange = useCallback(() => {
    const shouldReset =
      isElement(props.element) &&
      shouldResetContentEditable(
        editor,
        props.element.id ?? '',
        contentEditable
      );
    if (shouldReset !== null) {
      setContentEditable(shouldReset);
    }
  }, [contentEditable, editor, props.element]);

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
              onGenerateName={generate}
              onCancelGenerateName={cancel}
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
