import { MyEditor, VariableDefinitionElement } from '@decipad/editor-types';
import { SerializedType } from '@decipad/computer';
import { useEditorChange } from '@decipad/react-contexts';
import { useCallback, useState } from 'react';
import { dequal } from 'dequal';
import { findNodePath, getNode, getNodeString } from '@udecode/plate';
import { getDefined } from '@decipad/utils';
import { inferType } from '@decipad/editor-language-elements';

export const useTextTypeInference = (
  element: VariableDefinitionElement
): SerializedType => {
  const [inferredType, setInferredType] = useState<SerializedType>(() => ({
    kind: 'anything',
  }));

  const selectTextValue = useCallback(
    (editor: MyEditor): string | undefined => {
      const path = findNodePath(editor, element);
      if (path) {
        return getNodeString(getDefined(getNode(editor, [...path, 1])));
      }
      return undefined;
    },
    [element]
  );

  const inferAndSetType = useCallback(
    (text: string | undefined) => {
      if (text != null) {
        const { type: newType } = inferType(text);
        if (!dequal(newType, inferredType)) {
          setInferredType(newType);
        }
      }
    },
    [inferredType]
  );

  useEditorChange(inferAndSetType, selectTextValue);

  return inferredType;
};
