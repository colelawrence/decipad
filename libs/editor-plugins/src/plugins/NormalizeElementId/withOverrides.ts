/* eslint-disable no-param-reassign */
import { MyEditor } from '@decipad/editor-types';
import { setNodes, getChildren, TDescendant } from '@udecode/plate';
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

    return editor;
  };
