import { MyNodeEntry } from '@decipad/editor-types';
import { TDescendant, TEditor } from '@udecode/plate-common';
import { Element, type BaseEditor, NodeEntry, Node, Editor } from 'slate';

//
// An override of Slate's default normalizeNode behavior.
//
// We want to control this because Slate has some sensible defaults that are
// not applicable to the way we are using a root editor (And a mirror editor).
//
// Causing normalization cycles, and hidden assumptions.
//
// You can find out more about the original normalizeNode.
// @link https://github.com/ianstormtaylor/slate/blob/main/packages/slate/src/core/normalize-node.ts
//
// The defaults we want are:
// - Only allow Elements at the top level, remove other nodes.
// - Ignore anything inside `children` array, thats that components problem.
//
const normalizeNode = (editor: TEditor, entry: NodeEntry): boolean => {
  const [node, path] = entry;

  if (path.length === 0) return false;

  if (!Element.isElement(node)) {
    // Transforms.removeNodes(editor, { at: path, voids: true });
    const n = Node.get(editor, path) as TDescendant;
    editor.apply({ type: 'remove_node', node: n, path });
    return true;
  }

  return false;
};

//
// An override to the normal `editor.normalize` that slate provides.
//
// It guarantees that normalizations happen in order:
// 1) Default normalization (normalizeNode)
// 2) Plugins
//
export const normalizeCurried =
  (editor: TEditor, plugins: Array<(_entry: MyNodeEntry) => boolean>) =>
  (): void => {
    if (!Editor.isNormalizing(editor as BaseEditor)) {
      return;
    }
    editor.setNormalizing(false);

    let normalizeMax = 0;

    topLoop: while (normalizeMax < 200) {
      normalizeMax++;

      //
      // First, run the normalizeNode default
      // on the editor, and every child.
      //

      const topLevelEntry: NodeEntry = [editor, []];
      const topLevelNormalized = normalizeNode(editor, topLevelEntry);
      if (topLevelNormalized) {
        continue;
      }

      for (let i = 0; i < editor.children.length; i++) {
        const entry: NodeEntry = [editor.children[i], [i]];
        const normalized = normalizeNode(editor, entry);
        if (normalized) {
          continue topLoop;
        }
      }

      //
      // Second, run the plugins on the editor, and every child.
      //

      for (const plugin of plugins) {
        const topLevelPluginNormalized = plugin(topLevelEntry as MyNodeEntry);
        if (topLevelPluginNormalized) {
          continue topLoop;
        }

        for (let i = 0; i < editor.children.length; i++) {
          const entry: NodeEntry = [editor.children[i], [i]];
          const pluginNormalized = plugin(entry as MyNodeEntry);
          if (pluginNormalized) {
            continue topLoop;
          }
        }
      }

      // If we reach the end of all the loops, without continuing the loop.
      // We're good.
      break;
    }
    if (normalizeMax >= 200) {
      throw new Error('Normalization couldnt finish after 200 iterations');
    }

    editor.setNormalizing(true);
  };
