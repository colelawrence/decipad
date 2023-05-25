import { MyEditor } from '@decipad/editor-types';
import { findNode, isElement } from '@udecode/plate';

function* children(editor: MyEditor, blockId: string): Iterable<string> {
  const entry = findNode(editor, { at: [], match: { id: blockId } });
  if (entry) {
    const [node] = entry;
    if (isElement(node)) {
      for (const child of node.children) {
        if (isElement(child)) {
          yield child.id;
          for (const childId of children(editor, child.id)) {
            yield childId;
          }
        }
      }
    }
  }
}

export function* allBlockIds(
  editor: MyEditor,
  blockId: string
): Iterable<string> {
  yield blockId;
  for (const id of children(editor, blockId)) {
    yield id;
  }
}
