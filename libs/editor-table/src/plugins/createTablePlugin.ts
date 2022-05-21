import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  ELEMENT_TABLE_COLUMN_FORMULA,
  MyPlatePlugin,
} from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { decorateTextSyntax } from '@decipad/editor-utils';
import {
  Table,
  TableCell,
  TableHeaderCell,
  TableRow,
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
import { createPreventDeleteTableFromCaptionPlugin } from './createPreventDeleteTableFromCaptionPlugin';

type Attributes =
  | {
      colspan?: string;
      rowspan?: string;
    }
  | undefined;

export const createTablePlugin = (computer: Computer): MyPlatePlugin => ({
  key: ELEMENT_TABLE,
  isElement: true,
  component: Table,
  decorate: decorateTableCellUnits,
  deserializeHtml: {
    rules: [{ validNodeName: 'TABLE' }],
  },
  plugins: [
    createPreventEnterToCreateCellPlugin(),
    createPreventDeleteTableFromCaptionPlugin(),
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
      decorate: decorateTextSyntax(computer, ELEMENT_TABLE_COLUMN_FORMULA),
    },
  ],
});
