/* eslint-disable no-param-reassign */
import { MyElement, MyEditor } from '@decipad/editor-types';
import { isElement, setNodes, getChildren, TDescendant } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { pluginStore } from '@decipad/editor-utils';
import { Node, NodeEntry } from 'slate';

type Store = Set<string>;
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
      if (store.has(id)) {
        // duplicate found
        setNodes(editor, { id: nanoid() }, { at: path });
      }
      store.add(id);
    }
    scanIds(editor, store, getChildren(entry));
  }
};

export const withOverrides =
  (pluginKey: string) =>
  (editor: MyEditor): MyEditor => {
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

    const { apply } = editor;
    editor.apply = (op) => {
      switch (op.type) {
        case 'insert_node': {
          if (typeof op.node.id === 'string') {
            if (store.has(op.node.id)) {
              return apply({ ...op, node: { ...op.node, id: undefined } });
            }
            store.add(op.node.id);
          }
          return apply(op);
        }
        case 'remove_node': {
          const { id } = op.node as NodeWithId;
          if (id) {
            store.delete(id);
          }
          break;
        }
        case 'split_node': {
          return apply({
            ...op,
            properties: {
              ...op.properties,
              id: undefined,
            },
          });
        }
        case 'set_node': {
          if ('id' in op.newProperties) {
            const { id } = op.newProperties as NodeWithId;
            if (id != null && store.has(id)) {
              return apply({
                ...op,
                newProperties: { ...op.newProperties, id: undefined },
              });
            }
          }
          break;
        }
        case 'merge_node': {
          if ('id' in op.properties) {
            const { id } = op.properties as NodeWithId;
            if (id != null) {
              store.delete(id);
            }
          }
        }
      }
      apply(op);
    };

    const { normalizeNode } = editor;
    editor.normalizeNode = (entry) => {
      const [node, path] = entry;

      if (isElement(node) && !node.id) {
        setNodes<MyElement>(editor, { id: nanoid() }, { at: path });
        return;
      }

      return normalizeNode(entry);
    };

    return editor;
  };
