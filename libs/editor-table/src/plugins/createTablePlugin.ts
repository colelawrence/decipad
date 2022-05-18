import {
  ELEMENT_TABLE,
  ELEMENT_TR,
  ELEMENT_TH,
  ELEMENT_TD,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
} from '@decipad/editor-types';
import { PlatePlugin } from '@udecode/plate';
import { Computer } from '@decipad/computer';
import { decorateTextSyntax } from '@decipad/editor-utils';
import {
  Table,
  TableRow,
  TableCell,
  TableHeaderCell,
  TableCaption,
  TableColumnFormula,
} from '../components';
import { createArrowCellNavigationPlugin } from './createArrowCellNavigationPlugin';
import {
  createDecorateTableCellUnitsPlugin,
  decorateTableCellUnits,
} from './createDecorateTableCellUnitsPlugin';
import { createNormalizeTableFormulaPlugin } from './createNormalizeTableFormulaPlugin';
// import { createExtraColumnPlaceholderPlugin } from './createExtraColumnPlaceholderPlugin';
// import { createExtraRowPlaceholderPlugin } from './createExtraRowPlaceholderPlugin';
import { createNormalizeTableFormulaCellsPlugin } from './createNormalizeTableFormulaCellsPlugin';
import { createNormalizeTablesPlugin } from './createNormalizeTablesPlugin';
import { createPreventEnterToCreateCellPlugin } from './createPreventEnterToCreateCellPlugin';

export const createTablePlugin = (computer: Computer): PlatePlugin => ({
  key: ELEMENT_TABLE,
  isElement: true,
  component: Table,
  decorate: decorateTableCellUnits,
  deserializeHtml: {
    rules: [{ validNodeName: 'TABLE' }],
  },
  plugins: [
    createPreventEnterToCreateCellPlugin(),
    createNormalizeTablesPlugin(),
    createNormalizeTableFormulaCellsPlugin(),
    createDecorateTableCellUnitsPlugin(),
    createArrowCellNavigationPlugin(),
    // TODO: enable this
    // createExtraColumnPlaceholderPlugin(),
    // TODO: enable this
    // createExtraRowPlaceholderPlugin(),
    createNormalizeTableFormulaPlugin(),
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
          colSpan: element?.attributes?.colspan,
          rowSpan: element?.attributes?.rowspan,
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
          colSpan: element?.attributes?.colspan,
          rowSpan: element?.attributes?.rowspan,
        },
      }),
    },
    {
      key: ELEMENT_TABLE_COLUMN_FORMULA,
      isElement: true,
      component: TableColumnFormula,
      decorate: decorateTextSyntax(computer, ELEMENT_TABLE_COLUMN_FORMULA),
    },
  ],
});
