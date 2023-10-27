import { createOnKeyDownPluginFactory } from '@decipad/editor-plugins';
import {
  BlockElement,
  ELEMENT_TD,
  MyEditor,
  MyElement,
  MyValue,
  TableCellType,
} from '@decipad/editor-types';
import { last } from '@decipad/utils';
import { getBlockAbove } from '@udecode/plate';
import { Node, Path } from 'slate';
import { changeColumnType } from '../utils/changeColumnType';

const TRIGGER_KEY = '=';

export const createCellFormulaShortcutPlugin = createOnKeyDownPluginFactory<
  MyValue,
  MyEditor
>({
  name: 'ARROW_CELL_FORMULA_SHORTCUT_PLUGIN',
  plugin: (editor: MyEditor) => (event) => {
    if (event.key !== TRIGGER_KEY) return false;
    const entry = getBlockAbove<BlockElement>(editor);
    if (!entry) return false;

    const [node, path] = entry;
    const element: MyElement = node;
    const columnIndex = last(path);

    if (columnIndex == null || element.type !== ELEMENT_TD) return false;

    const content = Node.string(element).trim();

    if (content) return false;

    const tablePath = getTablePathFromCell(path);
    const cellType: TableCellType = { kind: 'table-formula' };

    changeColumnType(editor, tablePath, cellType, columnIndex);

    return false;
  },
});

const getTablePathFromCell = (path: Path): Path => {
  return path.slice(0, 1);
};
