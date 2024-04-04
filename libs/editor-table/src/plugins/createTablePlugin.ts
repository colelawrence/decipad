import type { RemoteComputer } from '@decipad/remote-computer';
import { createEventInterceptorPluginFactory } from '@decipad/editor-plugins';
import type { MyGenericEditor, MyPlatePlugin } from '@decipad/editor-types';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@decipad/editor-types';
import { decorateCode } from '@decipad/editor-utils';
import type { Value } from '@udecode/plate-common';
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
import { addColumn, addRow } from '../hooks/index';
import { createArrowCellNavigationPlugin } from './createArrowCellNavigationPlugin';
import { createCursorFocusPlugin } from './createCursorFocusPlugin';
import { createNormalizeTableFormulaAndSeriesCellsPlugin } from './createNormalizeTableFormulaAndSeriesCellsPlugin';
import { createNormalizeTablesPlugin } from './createNormalizeTablesPlugin';
import { createNormalizeTdPlugin } from './createNormalizeTdPlugin';
import { createClearCellPlugin } from './createClearCellPlugin';
import { onDropSmartCellResult } from './onDropSmartCellResult';
import { onKeyDownTable } from './onKeyDownTable';
import { withTable } from './withTable';
import type { TablePlugin } from '@udecode/plate-table';
import { TableAboveEditable } from './TableAboveEditable';
import { createNormalizeTableHeaderAggregationPlugin } from './createNormalizeTableHeaderAggregationPlugin';

type Attributes =
  | {
      colspan?: string;
      rowspan?: string;
    }
  | undefined;

export const createTablePlugin = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>(
  computer: RemoteComputer
): MyPlatePlugin<TablePlugin<TV>, TV> => ({
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
  renderAboveEditable: TableAboveEditable,
  withOverrides: withTable(),
  handlers: {
    onDrop: onDropSmartCellResult() as any,
    onKeyDown: onKeyDownTable(),
  },
  plugins: [
    createClearCellPlugin(),
    createArrowCellNavigationPlugin(),
    createCursorFocusPlugin(),
    // TODO: enable this
    // createExtraColumnPlaceholderPlugin(),
    // TODO: enable this
    // createExtraRowPlaceholderPlugin(),
    createNormalizeTableFormulaPlugin(computer),
    createNormalizeTableFormulaAndSeriesCellsPlugin(computer),
    createNormalizeTablesPlugin<TV, TE>(computer),
    createNormalizeTableHeaderAggregationPlugin(),
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
      isVoid: true,
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
      plugins: [createNormalizeTdPlugin()],
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
      decorate: decorateCode(computer, ELEMENT_TABLE_COLUMN_FORMULA),
    },
    createEventInterceptorPluginFactory({
      name: 'INTERCEPT_TABLE',
      elementTypes: [ELEMENT_TABLE],
      interceptor: (_, _1, event) => {
        if (event.type === 'on-enter') {
          return false;
        }
        return true;
      },
    })(),
  ],
});
