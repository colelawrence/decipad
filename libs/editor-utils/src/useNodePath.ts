import { MyNode, useTEditorRef } from '@decipad/editor-types';
import { useEditorSelector } from '@decipad/react-contexts';
import { findNodePath } from '@udecode/plate';
import { Path } from 'slate';

export const useNodePath = (node?: MyNode): Path | undefined => {
  const editor = useTEditorRef();
  return useEditorSelector(() => node && findNodePath(editor, node));
};
