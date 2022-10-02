import { MyEditor } from '@decipad/editor-types';
import { pluginStore } from '@decipad/editor-utils';
import { getChildren, isText, setNodes, TDescendant } from '@udecode/plate';
import { cloneDeep } from 'lodash';
import { nanoid } from 'nanoid';
import { Node, NodeEntry } from 'slate';
import { createOverrideApplyPluginFactory } from '../../pluginFactories';

const pluginKey = 'UNIQUE_ELEMENT_ID_PLUGIN';

type Store = Set<string>;
type NodeWithId = Node & { id?: string };
type WithChildren<T, C = unknown> = T & { children?: Array<C> };

const scanIds = (
  editor: MyEditor,
  store: Store,
  nodes: NodeEntry<TDescendant | MyEditor>[]
) => {
  for (const entry of nodes) {
    const [node, path] = entry;
    const { id } = node as NodeWithId;
    if (id) {
      if (store.has(id)) {
        // duplicate found
        setNodes(editor, { id: nanoid() }, { at: path });
      }
      store.add(id);
    }
    scanIds(editor, store, getChildren(entry));
  }
};

export const createUniqueElementIdPlugin = createOverrideApplyPluginFactory({
  name: pluginKey,
  plugin: (editor, apply) => {
    const store = pluginStore(editor, pluginKey, () => new Set<string>());
    // trap the first on change
    const { onChange } = editor;
    let done = false;
    // eslint-disable-next-line no-param-reassign
    editor.onChange = () => {
      if (!done) {
        done = true;
        scanIds(editor, store, [[editor, []]]);
      }

      onChange();
    };

    function ensureUniqueId<T extends {}, C extends {}>(
      obj: T
    ): T & { id?: string; children?: Array<C> } {
      if (isText(obj)) {
        return obj;
      }
      let { children } = obj as WithChildren<T>;
      if (children && Array.isArray(children)) {
        children = children.map(ensureUniqueId);
      }

      function replaceId() {
        const copy = cloneDeep(obj) as T & { id: string };
        copy.id = nanoid();
        store.add(copy.id);
        return copy;
      }

      let retValue = obj;

      if (!(retValue as unknown as { id: string }).id) {
        retValue = replaceId();
      }
      if (store.has((retValue as unknown as { id: string }).id)) {
        retValue = replaceId();
      }

      if (!children) {
        return retValue as T & { id: string };
      }
      return { ...retValue, children } as WithChildren<T, any> & {
        id: string;
      };
    }

    // eslint-disable-next-line no-param-reassign
    return (op) => {
      switch (op.type) {
        case 'insert_node': {
          const copy = ensureUniqueId(op.node);
          if (copy !== op.node) {
            return apply({ ...op, node: copy });
          }
          break;
        }
        case 'split_node': {
          return apply({
            ...op,
            properties: {
              ...op.properties,
              id: nanoid(),
            },
          });
        }
        case 'remove_node': {
          const { id } = op.node as NodeWithId;
          if (id) {
            store.delete(id);
          }
        }
      }
      apply(op);
    };
  },
});
