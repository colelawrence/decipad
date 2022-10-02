import { useEditorSelector } from '@decipad/react-contexts';
import { focusEditor, getStartPoint, hasNode } from '@udecode/plate';
import { useEffect, useRef } from 'react';
import { Path, Selection } from 'slate';
import { MyEditor } from '@decipad/editor-types';

const defaultSelection = [0] as Path;

const getSelection = (editor: MyEditor): Selection => {
  const initialPoint = getStartPoint(editor, defaultSelection);
  return { focus: initialPoint, anchor: initialPoint };
};

export const useInitialSelection = (loaded: boolean, editor?: MyEditor) => {
  // cursor
  const selection = useEditorSelector((ed) => ed.selection);

  // place the cursor on the notebook
  const setInitialSelection = useRef(false);
  useEffect(() => {
    if (!setInitialSelection.current && editor && loaded) {
      const initialSel = getSelection(editor);
      if (
        initialSel &&
        hasNode(editor, initialSel?.anchor.path) &&
        hasNode(editor, initialSel?.focus.path) &&
        !selection
      ) {
        setInitialSelection.current = true;
        const point = getStartPoint(editor, initialSel);
        focusEditor(editor, point);
      }
    }
  }, [editor, loaded, selection]);
};
