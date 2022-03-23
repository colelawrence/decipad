import { ELEMENT_INPUT, InputElement } from '@decipad/editor-types';
import { insertNodes, TDescendant, TEditor } from '@udecode/plate';
import { Path } from 'slate';
import { requirePathBelowBlock } from '@decipad/editor-utils';

const inputElement: Omit<InputElement, 'id'> = {
  type: ELEMENT_INPUT,
  variableName: '',
  value: '',
  children: [{ text: '' }],
};

export const insertInputBelow = (editor: TEditor, path: Path): void => {
  insertNodes<TDescendant>(editor, inputElement, {
    at: requirePathBelowBlock(editor, path),
  });
};
