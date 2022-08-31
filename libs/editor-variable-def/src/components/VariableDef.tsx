import {
  DraggableBlock,
  useTextTypeInference,
} from '@decipad/editor-components';
import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_VARIABLE_DEF,
  PlateComponent,
  useTEditorRef,
  VariableDefinitionElement,
  VariableSliderElement,
} from '@decipad/editor-types';
import {
  assertElementType,
  getElementUniqueName,
  insertNodeIntoColumns,
  safeDelete,
  useElementMutatorCallback,
} from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import {
  findNodePath,
  getNodeString,
  PlateEditor,
  serializeHtml,
  insertText,
} from '@udecode/plate';
import copy from 'copy-to-clipboard';
import { AvailableSwatchColor } from 'libs/ui/src/utils';
import { useCallback, useState } from 'react';

export const VariableDef: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  assertElementType(element, ELEMENT_VARIABLE_DEF);
  const [deleted, setDeleted] = useState(false);

  const editor = useTEditorRef();
  const readOnly = useIsEditorReadOnly();

  const onDelete = useCallback(() => {
    const path = findNodePath(editor, element);
    if (path) {
      setDeleted(true);
      safeDelete(editor, path);
    }
  }, [editor, element]);

  const onCopy = useCallback(() => {
    copy(serializeHtml(editor as PlateEditor, { nodes: [element] }), {
      format: 'text/html',
    });
  }, [editor, element]);

  const onAdd = useCallback(() => {
    const at = findNodePath(editor, element);
    if (at) {
      insertNodeIntoColumns(
        editor,
        {
          type: ELEMENT_VARIABLE_DEF,
          variant: element.variant,
          children: [
            {
              type: ELEMENT_CAPTION,
              children: [
                {
                  text: getElementUniqueName(
                    editor,
                    ELEMENT_VARIABLE_DEF,
                    element.variant,
                    element.variant === 'expression' ? 'Input' : 'Slider'
                  ),
                },
              ],
            },
            {
              type: ELEMENT_EXPRESSION,
              children: [{ text: '' }],
            },
          ],
        } as VariableDefinitionElement,
        at
      );
    }
  }, [editor, element]);

  // Slider
  const onChangeMax = useElementMutatorCallback(
    editor,
    (element as VariableSliderElement).children[2],
    'max'
  );
  const onChangeMin = useElementMutatorCallback(
    editor,
    (element as VariableSliderElement).children[2],
    'min'
  );
  const onChangeStep = useElementMutatorCallback(
    editor,
    (element as VariableSliderElement).children[2],
    'step'
  );

  const inferredType = useTextTypeInference(element);

  const onChangeType = useElementMutatorCallback(
    editor,
    element,
    'coerceToType'
  );

  const onChangeValue = useCallback(
    (value: string | undefined) => {
      const path = findNodePath(editor, element);
      if (path) {
        insertText(editor, value?.toString() ?? '', { at: [...path, 1] });
      }
    },
    [editor, element]
  );

  if (deleted) {
    return <></>;
  }

  const { color } = element.children[0];

  return (
    <div
      {...attributes}
      contentEditable={true}
      suppressContentEditableWarning
      id={element.id}
    >
      <DraggableBlock
        blockKind="interactive"
        element={element}
        onDelete={onDelete}
      >
        <organisms.VariableEditor
          variant={element.variant}
          onDelete={onDelete}
          onCopy={onCopy}
          onAdd={onAdd}
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
        >
          {children}
        </organisms.VariableEditor>
      </DraggableBlock>
    </div>
  );
};
