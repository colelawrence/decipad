import { MyNode, useTEditorRef } from '@decipad/editor-types';
import { useEditorChange } from '@decipad/editor-hooks';
import { findNodePath } from '@udecode/plate';
import { Path } from 'slate';
import { useCallback } from 'react';

export const useNodePath = (node?: MyNode): Path | undefined => {
  const editor = useTEditorRef();
  return useEditorChange(
    useCallback(() => node && findNodePath(editor, node), [editor, node])
  );
};
