import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  MyKeyboardHandler,
} from '@decipad/editor-types';
import isHotkey from 'is-hotkey';
import { findNode, moveSelection } from '@udecode/plate';
import { Path } from 'slate';
import { addColumn } from '../hooks/index';

export const onKeyDownTable: MyKeyboardHandler = (editor) => (event) => {
  if (isHotkey('shift+enter', event)) {
    const entry = findNode(editor, {
      match: { type: ELEMENT_TABLE_COLUMN_FORMULA },
    });

    if (entry) {
      event.preventDefault();
      event.stopPropagation();

      const [, path] = entry;

      addColumn(editor, {
        tablePath: Path.parent(Path.parent(path)),
        cellType: { kind: 'table-formula' },
      });
      moveSelection(editor);
    }
  }
};
