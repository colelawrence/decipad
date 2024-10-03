import { MyElement, useMyEditorRef } from '@decipad/editor-types';
import { getStartPoint, findNodePath, select } from '@udecode/plate-common';
import { useCallback } from 'react';
import { useNotebookMetaData } from '@decipad/react-contexts';

export const useEditElement = (element: MyElement): (() => void) => {
  const editor = useMyEditorRef();
  const { setSidebar } = useNotebookMetaData();

  return useCallback(() => {
    const path = findNodePath(editor, element);
    if (!path) return;
    select(editor, getStartPoint(editor, path));
    setSidebar({ type: 'default-sidebar', selectedTab: 'format' });
  }, [editor, element, setSidebar]);
};
