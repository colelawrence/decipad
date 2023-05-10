import { MyNode, useTEditorRef } from '@decipad/editor-types';
import { useEditorSelector } from '@decipad/react-contexts';
import { findNodePath } from '@udecode/plate';
import { useCallback } from 'react';
import { Path } from 'slate';

export const useNodePath = (node?: MyNode): Path | undefined => {
  const editor = useTEditorRef();
  return useEditorSelector(
    useCallback(() => node && findNodePath(editor, node), [editor, node])
  );
};
