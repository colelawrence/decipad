import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyPlatePlugin,
  MyWithOverride,
} from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { decorateTextSyntax } from '@decipad/editor-utils';
import { withTable } from '@udecode/plate';
import { isEnabled } from '@decipad/feature-flags';
import {
  Table,
  TableCaption,
  TableCell,
  TableColumnFormula,
  TableHeaderCell,
  TableRow,
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
import { createCellFormulaShortcutPlugin } from './createCellFormulaShortcutPlugin';
import { createCursorFocusPlugin } from './createCursorFocusPlugin';

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
  withOverrides: isEnabled('TABLE_CELL_SELECTION')
    ? (withTable as MyWithOverride)
    : undefined,
  plugins: [
    createPreventEnterToCreateCellPlugin(),
    createPreventDeleteTableFromCaptionPlugin(),
    createNormalizeTablesPlugin(),
    createNormalizeTableFormulaCellsPlugin(),
    createDecorateTableCellUnitsPlugin(),
    createArrowCellNavigationPlugin(),
    createCursorFocusPlugin(),
    // TODO: enable this
    // createExtraColumnPlaceholderPlugin(),
    // TODO: enable this
    // createExtraRowPlaceholderPlugin(),
    createNormalizeTableFormulaPlugin(),
    createCellFormulaShortcutPlugin(),
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
