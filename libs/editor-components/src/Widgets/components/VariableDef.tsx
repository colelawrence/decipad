import { DraggableBlock } from '../../block-management';
import type { PlateComponent } from '@decipad/editor-types';
import { ELEMENT_VARIABLE_DEF, useMyEditorRef } from '@decipad/editor-types';
import { assertElementType, mutateText } from '@decipad/editor-utils';
import {
  useEditorStylesContext,
  useInsideLayoutContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { VariableEditor } from '@decipad/ui';
import { findNodePath, getNodeString } from '@udecode/plate-common';
import type { AvailableSwatchColor } from 'libs/ui/src/utils';
import { useCallback } from 'react';
import { VariableEditorContextProvider } from './VariableEditorContext';
import { useEditElement } from '@decipad/editor-hooks';
import { useTextTypeInference } from '../../hooks';

export const VariableDef: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  assertElementType(element, ELEMENT_VARIABLE_DEF);

  const editor = useMyEditorRef();
  const readOnly = useIsEditorReadOnly();
  const insideLayout = useInsideLayoutContext();
  const onEdit = useEditElement(element);

  const inferredType = useTextTypeInference(element);

  const secondChild = element.children[1];

  const onChangeValue = useCallback(
    (value: string | undefined) => {
      const textPath = findNodePath(editor, secondChild);
      if (textPath) {
        mutateText(editor, textPath)(value?.toString() ?? '');
      }

      if (element.variant === 'date') {
        editor.deselect();
      }
    },
    [editor, element.variant, secondChild]
  );

  const { color: defaultColor } = useEditorStylesContext();

  const { color = defaultColor } = element.children[0];

  return (
    <DraggableBlock
      blockKind="interactive"
      element={element}
      contentEditable={true}
      suppressContentEditableWarning
      id={element.id}
      dependencyId={element.id}
      {...attributes}
    >
      <VariableEditorContextProvider
        value={{
          color: color as AvailableSwatchColor,
        }}
      >
        <VariableEditor
          variant={element.variant}
          color={color as AvailableSwatchColor}
          readOnly={readOnly}
          type={element.coerceToType ?? inferredType}
          value={getNodeString(element.children[1])}
          onChangeValue={onChangeValue}
          onClickEdit={onEdit}
          insideLayout={insideLayout}
        >
          {children}
        </VariableEditor>
      </VariableEditorContextProvider>
    </DraggableBlock>
  );
};
