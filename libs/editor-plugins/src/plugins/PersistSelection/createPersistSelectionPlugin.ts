import { createOverrideApplyPluginFactory } from '../../pluginFactories';
import { saveSelection } from './saveSelection';
import { selectionStorageKey } from './selectionStorageKey';

export const createPersistSelectionPlugin = createOverrideApplyPluginFactory({
  name: 'PLUGIN_PERSIST_SELECTION',
  plugin: (editor, apply) => {
    const selectionKey = selectionStorageKey(editor);
    return (op) => {
      if (op.type === 'set_selection') {
        saveSelection(selectionKey, {
          ...editor.selection,
          ...op.properties,
          ...op.newProperties,
        });
      }
      return apply(op);
    };
  },
});
