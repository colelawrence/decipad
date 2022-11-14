import {
  useEditorSelector,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import {
  focusEditor,
  getNode,
  getStartPoint,
  hasNode,
  isText,
  isElement,
  toDOMNode,
  isVoid,
} from '@udecode/plate';
import { useEffect } from 'react';
import { BaseSelection, Path, Selection } from 'slate';
import { MyEditor } from '@decipad/editor-types';
import { getPersistedSelection } from '@decipad/editor-plugins';
import { getPointSafe } from '@decipad/editor-utils';
import { useNotebookState } from '@decipad/notebook-state';

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
  const selection = useEditorSelector((ed) => ed.selection);
  const { initialFocusDone, setInitialFocusDone } = useNotebookState();
  const readOnly = useIsEditorReadOnly();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (!initialFocusDone && editor && loaded) {
      const initialSel = getSelection(editor);
      if (
        initialSel &&
        initialSel?.anchor &&
        initialSel?.focus &&
        hasNode(editor, initialSel?.anchor.path) &&
        hasNode(editor, initialSel?.focus.path) &&
        !selection &&
        !readOnly
      ) {
        setInitialFocusDone();

        timeout = setTimeout(() => {
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
            if (isVoid(editor, editorBlock)) {
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
            focusEditor(editor, { path: point.path, offset: 0 });
          } catch (err) {
            console.warn('error setting the initial selection', err);
          }
        }, 500);
      }
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [
    editor,
    initialFocusDone,
    loaded,
    readOnly,
    selection,
    setInitialFocusDone,
  ]);
};
