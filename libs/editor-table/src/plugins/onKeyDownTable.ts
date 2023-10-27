import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  MyKeyboardHandler,
} from '@decipad/editor-types';
import isHotkey from 'is-hotkey';
import {
  findNode,
  moveSelection,
  onKeyDownTable as onKeyDownTablePlate,
  Value,
} from '@udecode/plate';
import { Path } from 'slate';
import { addColumn } from '../hooks/index';
import { MyValue } from '../../../editor-types/src/value';

export const onKeyDownTable =
  <TV extends Value = MyValue>(): MyKeyboardHandler<object, TV> =>
  (editor, plugin) =>
  (event) => {
    onKeyDownTablePlate(editor, plugin)(event);

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
