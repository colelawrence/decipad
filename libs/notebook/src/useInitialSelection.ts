import { useEditorSelector } from '@decipad/react-contexts';
import {
  focusEditor,
  getNode,
  getStartPoint,
  hasNode,
  isText,
  isElement,
  toDOMNode,
} from '@udecode/plate';
import { useEffect, useRef } from 'react';
import { BaseSelection, Path, Selection } from 'slate';
import { MyEditor } from '@decipad/editor-types';
import { getPersistedSelection } from '@decipad/editor-plugins';
import { getPointSafe } from '@decipad/editor-utils';

const defaultSelection = [1] as Path;

const getDefaultSelection = (editor: MyEditor): Selection | undefined => {
  try {
    const initialPoint = getStartPoint(editor, defaultSelection);
    return { focus: initialPoint, anchor: initialPoint };
  } catch (err) {
    return undefined;
  }
};

const getSelection = (editor: MyEditor): BaseSelection => {
  const { selection } = editor;
  return {
    ...selection,
    ...getDefaultSelection(editor),
    ...getPersistedSelection(editor),
  } as BaseSelection;
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
        initialSel?.anchor &&
        initialSel?.focus &&
        hasNode(editor, initialSel?.anchor.path) &&
        hasNode(editor, initialSel?.focus.path) &&
        !selection
      ) {
        setInitialSelection.current = true;

        setTimeout(() => {
          try {
            const focusSel = initialSel.focus;
            if (!focusSel) {
              return;
            }
            const at = focusSel?.path;
            if (!at) {
              return;
            }
            const node = getNode(editor, at);
            if (!node) {
              return;
            }
            const path = at.slice(0, -1);
            const editorBlock = isText(node) ? getNode(editor, path) : node;
            if (!editorBlock || !isElement(editorBlock)) {
              return;
            }
            const block = toDOMNode(editor, editorBlock);
            if (!block) {
              return;
            }
            const point = getPointSafe(editor, initialSel.focus);
            if (!point) {
              return;
            }
            const bounding = block.getBoundingClientRect();
            if (bounding.top > window.innerHeight) {
              block.scrollIntoView();
            }
            focusEditor(editor, point);
          } catch (err) {
            console.warn('error setting the initial selection', err);
          }
        }, 0);
      }
    }
  }, [editor, loaded, selection]);
};
