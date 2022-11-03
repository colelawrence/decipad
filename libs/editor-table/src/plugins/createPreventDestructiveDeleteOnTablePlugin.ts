import { createOnKeyDownPluginFactory } from '@decipad/editor-plugins';
import {
  BlockElement,
  ELEMENT_TABLE,
  ELEMENT_TABLE_COLUMN_FORMULA,
} from '@decipad/editor-types';
import {
  getBlockAbove,
  getEndPoint,
  getStartPoint,
  isCollapsed,
} from '@udecode/plate';
import { Point } from 'slate';

export const createPreventDestructiveDeleteOnTablePlugin =
  createOnKeyDownPluginFactory({
    name: 'CREATE_PREVENT_DESTRUCTIVE_ON_TABLE_PLUGIN',
    plugin: (editor) => (event) => {
      if (event.code === 'Delete' || event.code === 'Backspace') {
        const isInsideTable = getBlockAbove<BlockElement>(editor, {
          match: { type: ELEMENT_TABLE },
        });
        const isInsideTableColumnFormula = getBlockAbove<BlockElement>(editor, {
          match: { type: ELEMENT_TABLE_COLUMN_FORMULA },
        });

        if (
          !editor.selection ||
          !isCollapsed(editor.selection) ||
          isInsideTableColumnFormula ||
          !isInsideTable
        ) {
          return false;
        }
        const { focus } = editor.selection;
        const avoidActionAtPoint =
          event.code === 'Delete'
            ? getEndPoint(editor, focus.path)
            : getStartPoint(editor, focus.path);
        if (Point.equals(editor.selection.focus, avoidActionAtPoint)) {
          event.stopPropagation();
          event.preventDefault();
          return true;
        }
      }
      return false;
    },
  });
