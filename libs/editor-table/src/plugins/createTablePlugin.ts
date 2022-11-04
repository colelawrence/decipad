import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyPlatePlugin,
  MyValue,
} from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { decorateCode } from '@decipad/editor-utils';
import { TablePlugin } from '@udecode/plate';
import {
  Table,
  TableCaption,
  TableCell,
  TableColumnFormula,
  TableHeaderCell,
  TableRow,
} from '../components';
import { createNormalizeTableFormulaPlugin } from './createNormalizeTableFormulaPlugin';
// import { createExtraColumnPlaceholderPlugin } from './createExtraColumnPlaceholderPlugin';
// import { createExtraRowPlaceholderPlugin } from './createExtraRowPlaceholderPlugin';
import { createNormalizeTableFormulaAndSeriesCellsPlugin } from './createNormalizeTableFormulaAndSeriesCellsPlugin';
import { createNormalizeTablesPlugin } from './createNormalizeTablesPlugin';
import { createPreventEnterToCreateCellPlugin } from './createPreventEnterToCreateCellPlugin';
import { createPreventDestructiveDeleteOnTablePlugin } from './createPreventDestructiveDeleteOnTablePlugin';
import { createCellFormulaShortcutPlugin } from './createCellFormulaShortcutPlugin';
import { createCursorFocusPlugin } from './createCursorFocusPlugin';
import { onDropSmartCellResult } from './onDropSmartCellResult';
import { addColumn, addRow } from '../hooks/index';
import { withTable } from './withTable';
import { onKeyDownTable } from './onKeyDownTable';

type Attributes =
  | {
      colspan?: string;
      rowspan?: string;
    }
  | undefined;

export const createTablePlugin = (
  computer: Computer
): MyPlatePlugin<TablePlugin<MyValue>> => ({
  key: ELEMENT_TABLE,
  isElement: true,
  component: Table,
  deserializeHtml: {
    rules: [{ validNodeName: 'TABLE' }],
  },
  options: {
    insertColumn: (editor, { fromCell }) => {
      const tablePath = fromCell.slice(0, -2);
      addColumn(editor, {
        tablePath,
      });
    },
    insertRow: (editor, { fromRow }) => {
      const tablePath = fromRow.slice(0, -1);
      addRow(editor, tablePath);
    },
  },
  withOverrides: withTable,
  handlers: {
    onDrop: onDropSmartCellResult,
    onKeyDown: onKeyDownTable,
  },
  plugins: [
    createPreventEnterToCreateCellPlugin(),
    createPreventDestructiveDeleteOnTablePlugin(),
    // createArrowCellNavigationPlugin(),
    createCursorFocusPlugin(),
    // TODO: enable this
    // createExtraColumnPlaceholderPlugin(),
    // TODO: enable this
    // createExtraRowPlaceholderPlugin(),
    createCellFormulaShortcutPlugin(),
    createNormalizeTableFormulaPlugin(/* computer */),
    createNormalizeTableFormulaAndSeriesCellsPlugin(computer),
    createNormalizeTablesPlugin(),
    {
      key: ELEMENT_TABLE_CAPTION,
      isElement: true,
      component: TableCaption,
    },
    {
      key: ELEMENT_TR,
      isElement: true,
      component: TableRow,
      deserializeHtml: {
        rules: [{ validNodeName: 'TR' }],
      },
    },
    {
      key: ELEMENT_TD,
      isElement: true,
      component: TableCell,
      deserializeHtml: {
        attributeNames: ['rowspan', 'colspan'],
        rules: [{ validNodeName: 'TD' }],
      },
      props: ({ element }) => ({
        nodeProps: {
          colSpan: (element?.attributes as Attributes)?.colspan,
          rowSpan: (element?.attributes as Attributes)?.rowspan,
        },
      }),
    },
    {
      key: ELEMENT_TH,
      isElement: true,
      component: TableHeaderCell,
      deserializeHtml: {
        attributeNames: ['rowspan', 'colspan'],
        rules: [{ validNodeName: 'TH' }],
      },
      props: ({ element }) => ({
        nodeProps: {
          colSpan: (element?.attributes as Attributes)?.colspan,
          rowSpan: (element?.attributes as Attributes)?.rowspan,
        },
      }),
    },
    {
      key: ELEMENT_TABLE_COLUMN_FORMULA,
      isElement: true,
      component: TableColumnFormula,
      decorate: decorateCode(ELEMENT_TABLE_COLUMN_FORMULA),
    },
  ],
});
