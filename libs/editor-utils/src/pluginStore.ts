/* eslint-disable no-param-reassign */
/* eslint-disable no-multi-assign */
import { MyEditor } from '@decipad/editor-types';

const pluginStoreSymbol = Symbol('PLUGIN_STORE');

type StoreByPlugin = Record<string, unknown>;
type StoreBearing = {
  [pluginStoreSymbol]?: StoreByPlugin;
};
type Creator<T> = () => T;

const editorStore = (editor: MyEditor): StoreByPlugin => {
  let store = (editor as StoreBearing)[pluginStoreSymbol];
  if (!store) {
    store = {};
    Object.defineProperty(editor, pluginStoreSymbol, {
      value: store,
      writable: false,
      enumerable: false,
    });
  }
  return store;
};

const getPluginStore = <T>(
  globalStore: StoreByPlugin,
  pluginKey: string,
  create: Creator<T>
): T => {
  let store = globalStore[pluginKey] as T | undefined;
  if (!store) {
    store = globalStore[pluginKey] = create();
  }
  return store;
};

export const pluginStore = <T>(
  editor: MyEditor,
  pluginKey: string,
  create: Creator<T>
): T => {
  const globalStore = editorStore(editor);
  return getPluginStore<T>(globalStore, pluginKey, create);
};
