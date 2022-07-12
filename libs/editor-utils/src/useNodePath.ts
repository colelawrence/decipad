import { MyNode, useTEditorRef } from '@decipad/editor-types';
import { useEditorChange } from '@decipad/react-contexts';
import { findNodePath } from '@udecode/plate';
import { dequal } from 'dequal';
import { useState } from 'react';
import { Path } from 'slate';

export const useNodePath = (node: MyNode): Path | undefined => {
  const editor = useTEditorRef();
  const [path, setPath] = useState<Path | undefined>(() =>
    findNodePath(editor, node)
  );
  useEditorChange(
    (newPath) => {
      if (!dequal(path, newPath)) {
        setPath(newPath);
      }
    },
    () => findNodePath(editor, node)
  );

  return path;
};
