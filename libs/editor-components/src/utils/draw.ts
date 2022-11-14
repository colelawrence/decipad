import { nanoid } from 'nanoid';
import { Path } from 'slate';
import {
  MyEditor,
  DrawElement,
  ELEMENT_DRAW,
  ELEMENT_FREEDRAW,
} from '@decipad/editor-types';
import { requirePathBelowBlock } from '@decipad/editor-utils';
import { insertNodes, setSelection, withoutNormalizing } from '@udecode/plate';

const getDrawElement = (): DrawElement => ({
  id: nanoid(),
  type: ELEMENT_DRAW,
  children: [
    {
      id: nanoid(),
      type: ELEMENT_FREEDRAW,
      points: [],
      pressures: [],
      __dummy: true, // IMPORTANT
      children: [{ text: '' }],
    },
  ],
});

export const insertDrawBelow = (editor: MyEditor, path: Path): void => {
  withoutNormalizing(editor, () => {
    // we need to focus on a path other than the current one because
    // otherwise Slate will try to find the selection path inside a
    // void element (the new DrawElement instance) and it will fail hard.
    const newFocusPath = Path.next(path);
    setSelection(editor, {
      focus: { path: newFocusPath, offset: 0 },
      anchor: {
        path: newFocusPath,
        offset: 0,
      },
    });
    insertNodes<DrawElement>(editor, getDrawElement(), {
      at: requirePathBelowBlock(editor, path),
    });
  });
};
