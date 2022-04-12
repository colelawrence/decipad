import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_VARIABLE_DEF,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import { insertNodes, TDescendant, TEditor } from '@udecode/plate';
import { Path } from 'slate';
import { requirePathBelowBlock } from '@decipad/editor-utils';

const inputElement = {
  type: ELEMENT_VARIABLE_DEF,
  children: [
    {
      type: ELEMENT_CAPTION,
      children: [{ text: '' }],
    },
    {
      type: ELEMENT_EXPRESSION,
      children: [{ text: '' }],
    },
  ],
} as VariableDefinitionElement;

export const insertInputBelow = (editor: TEditor, path: Path): void => {
  insertNodes<TDescendant>(editor, inputElement, {
    at: requirePathBelowBlock(editor, path),
  });
};
