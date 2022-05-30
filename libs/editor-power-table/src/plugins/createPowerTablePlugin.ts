import {
  ELEMENT_POWER_TABLE,
  ELEMENT_POWER_TH,
  ELEMENT_POWER_TR,
} from '@decipad/editor-types';
import { createPluginFactory } from '@udecode/plate';
import {
  PowerTable,
  PowerTableColumnHeader,
  PowerTableColumnHeaderRow,
} from '../components';

export const createPowerTablePlugin = createPluginFactory({
  key: ELEMENT_POWER_TABLE,
  isElement: true,
  component: PowerTable,
  plugins: [
    {
      key: ELEMENT_POWER_TR,
      isElement: true,
      component: PowerTableColumnHeaderRow,
    },
    {
      key: ELEMENT_POWER_TH,
      isElement: true,
      component: PowerTableColumnHeader,
    },
  ],
});
