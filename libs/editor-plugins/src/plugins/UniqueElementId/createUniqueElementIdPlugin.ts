import { createTPluginFactory, MyEditor } from '@decipad/editor-types';
import { pluginStore } from '@decipad/editor-utils';
import { findNode, getChildren, setNodes, TDescendant } from '@udecode/plate';
import { dequal } from 'dequal';
import { nanoid } from 'nanoid';
import { Node, NodeEntry } from 'slate';

const pluginKey = 'UNIQUE_ELEMENT_ID_PLUGIN';

type Store = Map<string, Node>;
type NodeWithId = Node & { id?: string };

const scanIds = (
  editor: MyEditor,
  store: Store,
  nodes: NodeEntry<TDescendant | MyEditor>[]
) => {
  for (const entry of nodes) {
    const [node, path] = entry;
    const { id } = node as NodeWithId;
    if (id) {
      const hasNode = store.get(id);
      if (hasNode && hasNode !== node) {
        // duplicate found
        setNodes(editor, { id: nanoid() }, { at: path });
      }
      store.set(id, node);
    }
    scanIds(editor, store, getChildren(entry));
  }
};

export const createUniqueElementIdPlugin = createTPluginFactory({
  key: pluginKey,
  withOverrides: (editor) => {
    const store = pluginStore(editor, pluginKey, () => new Map<string, Node>());
    // trap the first on change
    const { onChange } = editor;
    // eslint-disable-next-line no-param-reassign
    editor.onChange = () => {
      scanIds(editor, store, [[editor, []]]);

      // we only want to listen to the first onChange event
      // eslint-disable-next-line no-param-reassign
      editor.onChange = onChange;
      onChange();
    };

    const { apply } = editor;
    // eslint-disable-next-line no-param-reassign
    editor.apply = (op) => {
      if (op.type === 'insert_node') {
        const { id } = op.node as NodeWithId;
        if (id && store.has(id)) {
          const entry = findNode(editor, { at: op.path });
          if (!entry || !dequal(op.node, entry[0])) {
            // eslint-disable-next-line no-param-reassign
            op.node.id = nanoid();
          }
        }
      } else if (op.type === 'remove_node') {
        const { id } = op.node as NodeWithId;
        if (id && store.has(id)) {
          store.delete(id);
        }
      }
      apply(op);
    };

    return editor;
  },
});
