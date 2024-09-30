import {
  DraggableBlock,
  useTextTypeInference,
} from '@decipad/editor-components';
import type { PlateComponent } from '@decipad/editor-types';
import { ELEMENT_VARIABLE_DEF, useMyEditorRef } from '@decipad/editor-types';
import { assertElementType, mutateText } from '@decipad/editor-utils';
import {
  useEditorStylesContext,
  useInsideLayoutContext,
} from '@decipad/react-contexts';
import { VariableEditor } from '@decipad/ui';
import { findNodePath, getNodeString } from '@udecode/plate-common';
import type { AvailableSwatchColor } from 'libs/ui/src/utils';
import { useCallback } from 'react';
import { useTurnIntoProps } from '../utils/useTurnIntoProps';
import { VariableEditorContextProvider } from './VariableEditorContext';

export const VariableDef: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  assertElementType(element, ELEMENT_VARIABLE_DEF);

  const editor = useMyEditorRef();
  const insideLayout = useInsideLayoutContext();

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

  const turnIntoProps = useTurnIntoProps(element);

  const { color = defaultColor } = element.children[0];

  return (
    <DraggableBlock
      blockKind="interactive"
      element={element}
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
          color={color as AvailableSwatchColor}
          type={element.coerceToType ?? inferredType}
          value={getNodeString(element.children[1])}
          onChangeValue={onChangeValue}
          insideLayout={insideLayout}
        >
          {children}
        </VariableEditor>
      </VariableEditorContextProvider>
    </DraggableBlock>
  );
};
