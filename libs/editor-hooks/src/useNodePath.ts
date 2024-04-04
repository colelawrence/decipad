import type { MyNode } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { findNodePath } from '@udecode/plate-common';
import type { Path } from 'slate';
import { useCallback } from 'react';
import { useEditorChange } from './useEditorChange';

export const useNodePath = (node?: MyNode): Path | undefined => {
  const editor = useMyEditorRef();
  return useEditorChange(
    useCallback(() => node && findNodePath(editor, node), [editor, node])
  );
};
