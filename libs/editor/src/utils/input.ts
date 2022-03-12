import { ELEMENT_INPUT } from '@decipad/editor-types';
import Fraction from '@decipad/fraction';
import { insertNodes, TDescendant, TEditor } from '@udecode/plate';
import { Path } from 'slate';
import { requirePathBelowBlock } from './path';

const inputElement = {
  type: ELEMENT_INPUT,
  value: new Fraction(0),
  children: [],
} as const;

export const insertInputBelow = (editor: TEditor, path: Path): void => {
  insertNodes<TDescendant>(editor, inputElement, {
    at: requirePathBelowBlock(editor, path),
  });
};
