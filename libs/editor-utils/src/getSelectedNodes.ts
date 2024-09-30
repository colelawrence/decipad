import { MyEditor, MyNode } from '@decipad/editor-types';
import { getNodeEntries, isDescendant, isElement } from '@udecode/plate-common';
import { Path } from 'slate';
import { uniqWith } from 'lodash';

/**
 * Get all selected nodes, where a node is selected if:
 * - any part of the node is included in editor.selection OR
 * - the node or one of its ancestor nodes is included in selectedBlockIds.
 */
export const getSelectedNodes = (
  editor: MyEditor,
  selectedBlockIds: string[]
): MyNode[] => {
  const slateSelectedNodes = Array.from(
    getNodeEntries(editor, { match: isDescendant }),
    ([node]) => node
  );

  const blockSelectionPaths = Array.from(
    getNodeEntries(editor, {
      at: [],
      match: (node) =>
        isElement(node) && node.id && selectedBlockIds.includes(node.id),
    }),
    ([, path]) => path
  );

  const blockSelectedNodes = Array.from(
    getNodeEntries(editor, { at: [], match: isDescendant })
  )
    .filter(([, path]) =>
      blockSelectionPaths.some(
        (selectedPath) =>
          Path.equals(path, selectedPath) || Path.isAncestor(selectedPath, path)
      )
    )
    .map(([node]) => node);

  return uniqWith(
    [...slateSelectedNodes, ...blockSelectedNodes],
    (a, b) => a === b
  );
};
