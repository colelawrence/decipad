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

const defaultSelection = [1] as Path;

const getDefaultSelection = (editor: MyEditor): Selection => {
  const initialPoint = getStartPoint(editor, defaultSelection);
  return { focus: initialPoint, anchor: initialPoint };
};

const getSelection = (editor: MyEditor): BaseSelection => {
  const { selection } = editor;
  return {
    ...selection,
    ...getDefaultSelection(editor),
    ...getPersistedSelection(editor),
  } as BaseSelection;
};

const selectPath = (paths: Path[]): Path => {
  return paths.reduce((path, newPath) => {
    if (Path.isBefore(newPath, path)) {
      return newPath;
    }
    return path;
  });
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

        try {
          focusEditor(editor, initialSel);

          if (initialSel.focus?.path || initialSel.anchor?.path) {
            const at = selectPath([
              initialSel.focus?.path,
              initialSel.anchor?.path,
            ]);
            const node = getNode(editor, at);
            if (node) {
              const path = at.slice(0, -1);
              const editorBlock = isText(node) ? getNode(editor, path) : node;
              if (editorBlock && isElement(editorBlock)) {
                const block = toDOMNode(editor, editorBlock);
                if (block) {
                  const bounding = block.getBoundingClientRect();
                  if (bounding.top > window.innerHeight) {
                    block.scrollIntoView();
                  }
                }
              }
            }
          }
        } catch (err) {
          console.warn('error setting the initial selection');
        }
      }
    }
  }, [editor, loaded, selection]);
};
