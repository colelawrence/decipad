import type { RemoteComputer } from '@decipad/remote-computer';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TD,
  ELEMENT_TH,
  type MyGenericEditor,
  type MyPlatePlugin,
} from '@decipad/editor-types';
import { ELEMENT_TR, type TablePlugin } from '@udecode/plate-table';
import { type Value } from '@udecode/plate-common';
import { createNormalizeTdPlugin } from './createNormalizeTdPlugin';
import { createNormalizeTableFormulaPlugin } from './createNormalizeTableFormulaPlugin';
import { createNormalizeTableFormulaAndSeriesCellsPlugin } from './createNormalizeTableFormulaAndSeriesCellsPlugin';
import { createNormalizeTablesPlugin } from './createNormalizeTablesPlugin';

type Attributes =
  | {
      colspan?: string;
      rowspan?: string;
    }
  | undefined;

export const createTablePluginNoUI = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>(
  computer: RemoteComputer
): MyPlatePlugin<TablePlugin<TV>, TV> => ({
  key: ELEMENT_TABLE,
  isElement: true,
  plugins: [
    createNormalizeTableFormulaPlugin(computer),
    createNormalizeTableFormulaAndSeriesCellsPlugin(computer),
    createNormalizeTablesPlugin<TV, TE>(computer),
    {
      key: ELEMENT_TABLE_CAPTION,
      isElement: true,
    },
    {
      key: ELEMENT_TR,
      isElement: true,
      deserializeHtml: {
        rules: [{ validNodeName: 'TR' }],
      },
    },
    {
      key: ELEMENT_TD,
      isElement: true,
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
    },
  ],
});
