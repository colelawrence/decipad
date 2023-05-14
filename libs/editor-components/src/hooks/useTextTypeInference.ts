import { MyEditor, VariableDefinitionElement } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { useCallback, useState } from 'react';
import { dequal } from 'dequal';
import { findNodePath, getNode, getNodeString } from '@udecode/plate';
import { inferType } from '@decipad/parse';
import { SerializedType } from '@decipad/computer';
import { useEditorChangeCallback } from '@decipad/editor-hooks';

export const useTextTypeInference = (
  element: VariableDefinitionElement
): SerializedType => {
  const computer = useComputer();
  const [inferredType, setInferredType] = useState<SerializedType>(() => ({
    kind: 'anything',
  }));

  const selectTextValue = useCallback(
    (editor: MyEditor): string | undefined => {
      const path = findNodePath(editor, element);
      if (path) {
        const node = getNode(editor, [...path, 1]);
        if (node) {
          return getNodeString(node);
        }
      }
      return undefined;
    },
    [element]
  );

  const inferAndSetType = useCallback(
    async (text: string | undefined) => {
      if (text != null) {
        const { type: newType } = await inferType(computer, text);
        if (!dequal(newType, inferredType)) {
          setInferredType(newType);
        }
      }
    },
    [computer, inferredType]
  );

  useEditorChangeCallback(selectTextValue, inferAndSetType);

  return inferredType;
};
