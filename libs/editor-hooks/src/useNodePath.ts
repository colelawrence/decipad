import { MyNode, useTEditorRef } from '@decipad/editor-types';
import { findNodePath } from '@udecode/plate';
import { Path } from 'slate';
import { useCallback } from 'react';
import { useEditorChange } from './useEditorChange';

export const useNodePath = (node?: MyNode): Path | undefined => {
  const editor = useTEditorRef();
  return useEditorChange(
    useCallback(() => node && findNodePath(editor, node), [editor, node])
  );
};
