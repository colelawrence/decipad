import {
  ELEMENT_TABLE,
  ELEMENT_TR,
  ELEMENT_TH,
  ELEMENT_TD,
  ELEMENT_TABLE_CAPTION,
} from '@decipad/editor-types';
import { createPluginFactory } from '@udecode/plate';
import {
  Table,
  TableRow,
  TableCell,
  TableHeaderCell,
  TableCaption,
} from '../components';
import { createArrowCellNavigationPlugin } from './createArrowCellNavigationPlugin';
import {
  createDecorateTableCellUnitsPlugin,
  decorateTableCellUnits,
} from './createDecorateTableCellUnitsPlugin';
// import { createExtraColumnPlaceholderPlugin } from './createExtraColumnPlaceholderPlugin';
// import { createExtraRowPlaceholderPlugin } from './createExtraRowPlaceholderPlugin';
import { createNormalizeTableFormulasPlugin } from './createNormalizeTableFormulasPlugin';
import { createNormalizeTablesPlugin } from './createNormalizeTablesPlugin';
import { createPreventEnterToCreateCellPlugin } from './createPreventEnterToCreateCellPlugin';

export const createTablePlugin = createPluginFactory({
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
    createNormalizeTableFormulasPlugin(),
    createDecorateTableCellUnitsPlugin(),
    createArrowCellNavigationPlugin(),
    // TODO: enable this
    // createExtraColumnPlaceholderPlugin(),
    // TODO: enable this
    // createExtraRowPlaceholderPlugin(),
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
  ],
});
