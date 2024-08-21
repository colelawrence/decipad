import { CodeLineV2Element } from '@decipad/editor-types';
import { EditorController } from '@decipad/notebook-tabs';
import { Path } from 'slate';

export function resetChanges(
  controller: EditorController,
  oldEntry: [CodeLineV2Element, Path],
  newEntry: [CodeLineV2Element, Path]
) {
  const [node, path] = oldEntry;
  const [oldVarName, oldCode] = node.children;

  const [newNode] = newEntry;
  const [newVarName, newCode] = newNode.children;

  controller.withoutNormalizing(() => {
    controller.apply({
      type: 'insert_node',
      path: [...path, 0, 0],
      node: oldVarName.children[0],
    });

    controller.apply({
      type: 'remove_node',
      path: [...path, 0, 1],
      node: newVarName.children[0],
      SKIP: true,
    });

    for (let i = 0; i < oldCode.children.length; i++) {
      controller.apply({
        type: 'insert_node',
        path: [...path, 1, i],
        node: oldCode.children[i],
      });
    }

    for (let i = 0; i < newCode.children.length; i++) {
      controller.apply({
        type: 'remove_node',
        path: [...path, 1, oldCode.children.length],
        node: newCode.children[i],
        SKIP: true,
      });
    }
  });
}
