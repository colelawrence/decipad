import { createOnKeyDownPluginFactory } from '@decipad/editor-plugins';
import {
  BlockElement,
  ELEMENT_TABLE,
  ELEMENT_TABLE_COLUMN_FORMULA,
} from '@decipad/editor-types';
import {
  getBlockAbove,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { ELEMENT_TD } from '@udecode/plate-table';
import { getSelectedCells } from '../utils/getSelectedCells';
import { setCellText } from '../utils';

export const createClearCellPlugin = createOnKeyDownPluginFactory({
  name: 'CREATE_CLEAR_CELL_PLUGIN',
  plugin: (editor) => (event) => {
    if (event.code === 'Delete' || event.code === 'Backspace') {
      const isInsideTable = getBlockAbove<BlockElement>(editor, {
        match: { type: ELEMENT_TABLE },
      });

      const isInsideTableColumnFormula = getBlockAbove<BlockElement>(editor, {
        match: { type: ELEMENT_TABLE_COLUMN_FORMULA },
      });

      if (!editor.selection || isInsideTableColumnFormula || !isInsideTable) {
        return false;
      }

      const selectedCells = getSelectedCells<Value>(editor);
      let deletedAny = false;

      withoutNormalizing(editor, () => {
        selectedCells.forEach(([cell, path]) => {
          if (cell.type !== ELEMENT_TD) return;
          setCellText<Value>(editor, path, '');
          deletedAny = true;
        });
      });

      if (deletedAny) {
        event.stopPropagation();
        event.preventDefault();
        return true;
      }
    }

    return false;
  },
});
