/* eslint-disable no-param-reassign */
import { MyGenericEditor } from '@decipad/editor-types';
import {
  setNodes,
  getChildren,
  TDescendant,
  Value,
  TNodeProps,
  TEditor,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { pluginStore } from '@decipad/editor-utils';
import { Node, NodeEntry } from 'slate';

type Store = Set<string>;
type NodeWithId = Node & { id?: string };

const scanIds = <TV extends Value, TE extends MyGenericEditor<TV>>(
  editor: TE,
  store: Store,
  nodes: NodeEntry<TDescendant | TE>[]
) => {
  for (const entry of nodes) {
    const [node, path] = entry;
    const { id } = node as NodeWithId;
    if (id) {
      if (store.has(id)) {
        // duplicate found
        setNodes(
          editor,
          { id: nanoid() } as unknown as Partial<TNodeProps<TEditor<TV>>>,
          {
            at: path,
          }
        );
      }
      store.add(id);
    }
    scanIds<TV, TE>(editor, store, getChildren(entry));
  }
};

export const withOverrides =
  <TV extends Value, TE extends MyGenericEditor<TV>>(pluginKey: string) =>
  (editor: TE): TE => {
    const store = pluginStore<Store, TV, TE>(
      editor,
      pluginKey,
      () => new Set<string>()
    );

    // trap the first on change
    const { onChange } = editor;
    let done = false;
    // eslint-disable-next-line no-param-reassign
    editor.onChange = () => {
      if (!done) {
        done = true;
        scanIds<TV, TE>(editor, store, [[editor, []]]);
      }

      onChange();
    };

    return editor;
  };
