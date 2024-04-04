import type {
  MyKeyboardHandler,
  MyValue,
  MyGenericEditor,
} from '@decipad/editor-types';
import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
} from '@decipad/editor-types';
import isHotkey from 'is-hotkey';
import type { TElement, Value } from '@udecode/plate-common';
import {
  findNode,
  getAboveNode,
  moveSelection,
  select,
  getNodeEntries,
  getBlockAbove,
  getPointBefore,
} from '@udecode/plate-common';
import { Path } from 'slate';
import { addColumn } from '../hooks/index';
import { selectNextCell } from '../utils/selectNextCell';

export const onKeyDownTable =
  <
    TV extends Value = MyValue,
    TE extends MyGenericEditor<TV> = MyGenericEditor<TV>
  >(): MyKeyboardHandler<object, TV, TE> =>
  (editor) =>
  (event) => {
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

    // Select next cell on enter (header cells only)
    if (isHotkey('enter', event)) {
      const entry = getBlockAbove(editor, {
        match: { type: ELEMENT_TH },
      });

      if (entry) {
        const [, path] = entry;
        selectNextCell(editor as any, path);
        event.stopPropagation();
        event.preventDefault();
      }
    }

    // Select next cell on tab
    if (isHotkey('tab', event)) {
      const entry = getBlockAbove(editor, {
        match: { type: [ELEMENT_TD, ELEMENT_TH] },
      });

      if (entry) {
        const [, path] = entry;
        selectNextCell(editor as any, path);
        event.stopPropagation();
        event.preventDefault();
      }
    }

    if (isHotkey('shift+tab', event)) {
      const entry = getBlockAbove(editor, {
        match: { type: [ELEMENT_TD, ELEMENT_TH] },
      });

      if (entry) {
        const [, path] = entry;
        const after = getPointBefore(editor, path);
        if (after) {
          select(editor, after);
        }
        event.stopPropagation();
        event.preventDefault();
      }
    }

    // Select all cells in the table
    if (isHotkey('mod+a', event)) {
      const res = getAboveNode<TElement>(editor, {
        match: { type: ELEMENT_TABLE },
      });
      if (!res) return;

      const [, tablePath] = res;

      const cells = Array.from(
        getNodeEntries(editor, {
          at: tablePath,
          match: { type: ELEMENT_TD },
        })
      );
      if (cells.length === 0) return;

      const [, firstCellPath] = cells[0];
      const [, lastCellPath] = cells[cells.length - 1];

      select(editor, {
        anchor: { path: firstCellPath.concat([0]), offset: 0 },
        focus: { path: lastCellPath.concat([0]), offset: 0 },
      });

      event.preventDefault();
      event.stopPropagation();
    }
  };
