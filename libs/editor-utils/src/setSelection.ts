import { Selection } from 'slate';
import {
  TEditor,
  Value,
  // eslint-disable-next-line no-restricted-imports
  setSelection as plateSetSelection,
  deselect,
} from '@udecode/plate-common';
import { hasPoint } from './hasPoint';

const isValidSelection = <
  TV extends Value,
  TE extends TEditor<TV> = TEditor<TV>
>(
  editor: TE,
  sel: Partial<Selection>
): boolean => {
  if (sel != null) {
    if (sel.anchor && !hasPoint(editor, sel.anchor)) {
      return false;
    }
    if (sel.focus && !hasPoint(editor, sel.focus)) {
      return false;
    }
  }
  return true;
};

export const setSelection = <
  TV extends Value,
  TE extends TEditor<TV> = TEditor<TV>
>(
  editor: TE,
  sel: Partial<Selection>
): void => {
  if (sel === null) {
    deselect(editor);
  } else if (isValidSelection(editor, sel)) {
    plateSetSelection(editor, sel);
  }
};
