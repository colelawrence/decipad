import { ClientEventsContext } from '@decipad/client-events';
import {
  DraggableBlock,
  useTextTypeInference,
} from '@decipad/editor-components';
import {
  ELEMENT_DISPLAY,
  ELEMENT_VARIABLE_DEF,
  PlateComponent,
  useTEditorRef,
  VariableDropdownElement,
  VariableSliderElement,
} from '@decipad/editor-types';
import {
  assertElementType,
  hasLayoutAncestor,
  mutateText,
  safeDelete,
  usePathMutatorCallback,
  useNodePath,
  wrapIntoColumns,
} from '@decipad/editor-utils';
import { SerializedType } from '@decipad/computer';
import {
  useEditorStylesContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { VariableEditor } from '@decipad/ui';
import {
  findNode,
  findNodePath,
  getNodeString,
  moveNodes,
  PlateEditor,
  serializeHtml,
  withoutNormalizing,
} from '@udecode/plate';
import copy from 'copy-to-clipboard';
import { defaultMoveNode } from 'libs/editor-components/src/utils/useDnd';
import { AvailableSwatchColor } from 'libs/ui/src/utils';
import { ComponentProps, useCallback, useContext, useState } from 'react';
import { Path } from 'slate';
import { useTurnIntoProps } from '../utils/useTurnIntoProps';
import { VariableEditorContextProvider } from './VariableEditorContext';

export const VariableDef: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  assertElementType(element, ELEMENT_VARIABLE_DEF);
  const [deleted, setDeleted] = useState(false);

  const editor = useTEditorRef();
  const readOnly = useIsEditorReadOnly();
  const userEvents = useContext(ClientEventsContext);
  const path = useNodePath(element);

  const onDelete = useCallback(() => {
    if (path) {
      setDeleted(true);
      safeDelete(editor, path);
    }
  }, [editor, path]);

  const onCopy = useCallback(() => {
    copy(serializeHtml(editor as PlateEditor, { nodes: [element] }), {
      format: 'text/html',
    });
  }, [editor, element]);

  const sliderElementPath = useNodePath(
    (element as VariableSliderElement).children[2]
  );
  // Slider
  const onChangeMax = usePathMutatorCallback(editor, sliderElementPath, 'max');
  const onChangeMin = usePathMutatorCallback(editor, sliderElementPath, 'min');
  const onChangeStep = usePathMutatorCallback(
    editor,
    sliderElementPath,
    'step'
  );

  const dropDownElementPath = useNodePath(element.children[1]);
  const onChangeSmartSelection = usePathMutatorCallback(
    editor,
    dropDownElementPath,
    'smartSelection'
  );

  const inferredType = useTextTypeInference(element);

  const onChangeTypeMutator = usePathMutatorCallback(
    editor,
    path,
    'coerceToType'
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

  const isHorizontal = !deleted && path && hasLayoutAncestor(editor, path);

  const getAxis = useCallback<
    NonNullable<ComponentProps<typeof DraggableBlock>['getAxis']>
  >(
    (_, monitor) => ({
      horizontal:
        monitor.getItemType() === ELEMENT_VARIABLE_DEF ||
        monitor.getItemType() === ELEMENT_DISPLAY,
      vertical: !isHorizontal,
    }),
    [isHorizontal]
  );

  const onDrop = useCallback<
    NonNullable<ComponentProps<typeof DraggableBlock>['onDrop']>
  >(
    (item, _, direction) => {
      if (!path || (direction !== 'left' && direction !== 'right')) {
        return defaultMoveNode(editor, item, element.id, direction);
      }

      withoutNormalizing(editor, () => {
        const dragPath = findNode(editor, {
          at: [],
          match: { id: item.id },
        })?.[1];
        let dropPath: Path = [];

        if (isHorizontal) {
          if (direction === 'left') {
            dropPath = path;
          }
          if (direction === 'right') {
            dropPath = Path.next(path);
          }
        } else {
          dropPath = [...path, direction === 'left' ? 0 : 1];
          wrapIntoColumns(editor, path);
        }

        moveNodes(editor, { at: dragPath, to: dropPath });
      });
    },
    [editor, element.id, isHorizontal, path]
  );

  const { color: defaultColor } = useEditorStylesContext();

  const turnIntoProps = useTurnIntoProps(element);

  if (deleted) {
    return <></>;
  }
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
          onDelete={onDelete}
          onCopy={onCopy}
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
