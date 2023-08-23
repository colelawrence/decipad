import { ClientEventsContext } from '@decipad/client-events';
import { SerializedType } from '@decipad/computer';
import {
  DraggableBlock,
  useDragAndDropGetAxis,
  useDragAndDropOnDrop,
  useTextTypeInference,
} from '@decipad/editor-components';
import {
  ELEMENT_DISPLAY,
  ELEMENT_VARIABLE_DEF,
  PlateComponent,
  VariableDropdownElement,
  VariableSliderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  isDragAndDropHorizontal,
  mutateText,
} from '@decipad/editor-utils';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import {
  useEditorStylesContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { VariableEditor } from '@decipad/ui';
import { findNodePath, getNodeString } from '@udecode/plate';
import { AvailableSwatchColor } from 'libs/ui/src/utils';
import { useCallback, useContext } from 'react';
import { useTurnIntoProps } from '../utils/useTurnIntoProps';
import { VariableEditorContextProvider } from './VariableEditorContext';

export const VariableDef: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  assertElementType(element, ELEMENT_VARIABLE_DEF);

  const editor = useTEditorRef();
  const readOnly = useIsEditorReadOnly();
  const userEvents = useContext(ClientEventsContext);
  const path = useNodePath(element);

  const sliderElementPath = useNodePath(
    (element as VariableSliderElement).children[2]
  );
  // Slider
  const onChangeMax = usePathMutatorCallback(
    editor,
    sliderElementPath,
    'max',
    'VariableDef'
  );
  const onChangeMin = usePathMutatorCallback(
    editor,
    sliderElementPath,
    'min',
    'VariableDef'
  );
  const onChangeStep = usePathMutatorCallback(
    editor,
    sliderElementPath,
    'step',
    'VariableDef'
  );

  const dropDownElementPath = useNodePath(element.children[1]);
  const onChangeSmartSelection = usePathMutatorCallback(
    editor,
    dropDownElementPath,
    'smartSelection',
    'VariableDef'
  );

  const inferredType = useTextTypeInference(element);

  const onChangeTypeMutator = usePathMutatorCallback(
    editor,
    path,
    'coerceToType',
    'VariableDef'
  );
  const onChangeType = useCallback(
    (type: SerializedType | 'smart-selection' | undefined): void => {
      // Analytics
      userEvents({
        type: 'action',
        action: 'widget type changed',
        props: {
          variant: element.variant,
          ...(element.variant === 'date' &&
            type !== 'smart-selection' &&
            type?.kind === 'date' && {
              subVar: type.date,
            }),
          isReadOnly: readOnly,
          newType:
            type === 'smart-selection' ? 'smart-selection' : type?.kind || '',
        },
      });

      // Used for dropdown widget
      if (type === 'smart-selection') {
        onChangeSmartSelection(
          !(element as VariableDropdownElement).children[1].smartSelection
        );
        onChangeTypeMutator({
          kind: 'number',
          unit: null,
        });
      } else {
        // When dropdown widget changes to text ot input, it is no longer a smart selection
        if (element.variant === 'dropdown') {
          onChangeSmartSelection(false);
        }
        onChangeTypeMutator(type);
      }
    },
    [onChangeTypeMutator, onChangeSmartSelection, element, userEvents, readOnly]
  );

  const secondChild = element.children[1];

  const onChangeValue = useCallback(
    (value: string | undefined) => {
      const textPath = findNodePath(editor, secondChild);
      if (textPath) {
        mutateText(editor, textPath)(value?.toString() ?? '');
      }
    },
    [editor, secondChild]
  );

  const isHorizontal = isDragAndDropHorizontal(false, editor, path);
  const getAxis = useDragAndDropGetAxis({ isHorizontal });
  const onDrop = useDragAndDropOnDrop({ editor, element, path, isHorizontal });

  const { color: defaultColor } = useEditorStylesContext();

  const turnIntoProps = useTurnIntoProps(element);

  const { color = defaultColor } = element.children[0];

  return (
    <DraggableBlock
      blockKind="interactive"
      element={element}
      accept={
        isHorizontal ? [ELEMENT_VARIABLE_DEF, ELEMENT_DISPLAY] : undefined
      }
      getAxis={getAxis}
      onDrop={onDrop}
      contentEditable={true}
      suppressContentEditableWarning
      id={element.id}
      dependencyId={element.id}
      {...turnIntoProps}
      {...attributes}
    >
      <VariableEditorContextProvider
        value={{
          color: color as AvailableSwatchColor,
        }}
      >
        <VariableEditor
          variant={element.variant}
          onChangeMax={onChangeMax}
          onChangeMin={onChangeMin}
          onChangeStep={onChangeStep}
          max={
            element.variant === 'slider' ? element.children[2]?.max : undefined
          }
          min={
            element.variant === 'slider' ? element.children[2]?.min : undefined
          }
          step={
            element.variant === 'slider' ? element.children[2]?.step : undefined
          }
          color={color as AvailableSwatchColor}
          readOnly={readOnly}
          type={element.coerceToType ?? inferredType}
          onChangeType={onChangeType}
          value={getNodeString(element.children[1])}
          onChangeValue={onChangeValue}
          smartSelection={
            element.variant === 'dropdown'
              ? element.children[1].smartSelection
              : false
          }
          element={element}
        >
          {children}
        </VariableEditor>
      </VariableEditorContextProvider>
    </DraggableBlock>
  );
};
