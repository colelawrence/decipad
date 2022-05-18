import { getAboveNode, isText } from '@udecode/plate';
import {
  createTPluginFactory,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TR,
  MyDecorate,
} from '@decipad/editor-types';
import { stringifyUnits } from '@decipad/computer';
import { DECORATION_CELL_UNIT } from '../constants';
import { TableCellUnitLeaf } from '../components';
import { DecorationCellUnit } from '../types';

export const decorateTableCellUnits: MyDecorate =
  (editor) =>
  ([node, path]): DecorationCellUnit[] | undefined => {
    if (!isText(node)) {
      return undefined;
    }
    const columnIndex = path[path.length - 2];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [parent, parentPath] = getAboveNode(editor, {
      at: path,
    })!;
    if (parent.type !== ELEMENT_TD) {
      return undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [row, rowPath] = getAboveNode(editor, {
      at: parentPath,
    })!;
    if (row.type !== ELEMENT_TR) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [table] = getAboveNode(editor, {
      at: rowPath,
    })!;

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

export const createDecorateTableCellUnitsPlugin = createTPluginFactory({
  key: DECORATION_CELL_UNIT,
  type: DECORATION_CELL_UNIT,
  isLeaf: true,
  component: TableCellUnitLeaf,
});
