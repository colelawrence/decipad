import { MyNode } from '@decipad/editor-types';
import {
  useEditorChange,
  UseEditorChangeOptions,
} from '@decipad/react-contexts';
import { getNodeString } from '@udecode/plate';
import { dequal } from 'dequal';
import { useState } from 'react';

export const useNodeText = (
  node: MyNode,
  options?: UseEditorChangeOptions
): string | undefined => {
  const [text, setText] = useState<string | undefined>(() =>
    getNodeString(node)
  );
  useEditorChange(
    (newText) => {
      if (!dequal(text, newText)) {
        setText(newText);
      }
    },
    () => getNodeString(node),
    options
  );

  return text;
};
