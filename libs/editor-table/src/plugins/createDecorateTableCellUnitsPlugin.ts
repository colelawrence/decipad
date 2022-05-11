import { Editor, NodeEntry, Text } from 'slate';
import { createPluginFactory, Decorate } from '@udecode/plate';
import {
  Element,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TR,
} from '@decipad/editor-types';
import { stringifyUnits } from '@decipad/computer';
import { DECORATION_CELL_UNIT } from '../constants';
import { TableCellUnitLeaf } from '../components';
import { DecorationCellUnit } from '../types';

export const decorateTableCellUnits: Decorate =
  (editor) =>
  ([node, path]: NodeEntry): DecorationCellUnit[] | undefined => {
    if (!Text.isText(node)) {
      return undefined;
    }
    const columnIndex = path[path.length - 2];
    const [parent, parentPath] = Editor.above(editor, {
      at: path,
    }) as NodeEntry<Element>;
    if (parent.type !== ELEMENT_TD) {
      return undefined;
    }
    const [row, rowPath] = Editor.above(editor, {
      at: parentPath,
    }) as NodeEntry<Element>;
    if (row.type !== ELEMENT_TR) {
      return undefined;
    }

    const [table] = Editor.above(editor, {
      at: rowPath,
    }) as NodeEntry<Element>;

    if (table.type !== ELEMENT_TABLE) {
      return undefined;
    }
    const firstRow = table.children[1];
    const columnHeader = firstRow.children[columnIndex];
    if (!columnHeader) {
      return undefined;
    }
    if (columnHeader.cellType && columnHeader.cellType.kind === 'number') {
      const { unit } = columnHeader.cellType;
      if (!unit) {
        return undefined;
      }
      const unitString = stringifyUnits(unit);
      return [
        {
          [DECORATION_CELL_UNIT]: true,
          unitString,
          anchor: {
            path,
            offset: 0,
          },
          focus: {
            path,
            offset: node.text.length,
          },
        },
      ];
    }
    return undefined;
  };

export const createDecorateTableCellUnitsPlugin = createPluginFactory({
  key: DECORATION_CELL_UNIT,
  type: DECORATION_CELL_UNIT,
  isLeaf: true,
  component: TableCellUnitLeaf,
});
