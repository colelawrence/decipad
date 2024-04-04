import type { MyEditor } from '@decipad/editor-types';
import { findNode, isElement } from '@udecode/plate-common';

/**
 * Some `any` casts because typecheck seems to disagree with the
 * definition of `MyElement`.
 */
function* children(editor: MyEditor, blockId: string): Iterable<string> {
  const entry = findNode(editor, { at: [], match: { id: blockId } });
  if (entry) {
    const [node] = entry;
    if (isElement(node)) {
      for (const child of node.children) {
        if (isElement(child)) {
          yield child.id as string;
          for (const childId of children(editor, child.id as any)) {
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
  for (const id of children(editor, blockId)) {
    yield id;
  }
  yield blockId;
}
