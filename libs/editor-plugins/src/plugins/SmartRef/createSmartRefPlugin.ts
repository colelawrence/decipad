import { createTPluginFactory, ELEMENT_SMART_REF } from '@decipad/editor-types';
import { SmartRef } from './components/SmartRef';
import { createSmartRefKeysPlugin } from './plugins/createSmartRefKeysPlugin';
import { migrateTableColumnSmartRefs } from './plugins/migrateTableColumnSmartRefs';
import { migrateTableTextRefsToSmartRefs } from './plugins/migrateTableTextToSmartRefs';

export const createSmartRefPlugin = createTPluginFactory({
  key: ELEMENT_SMART_REF,
  type: ELEMENT_SMART_REF,
  isInline: true,
  isVoid: true,
  isElement: true,
  component: SmartRef,
  plugins: [
    createSmartRefKeysPlugin(),
    migrateTableColumnSmartRefs(),
    migrateTableTextRefsToSmartRefs(),
  ],
});
