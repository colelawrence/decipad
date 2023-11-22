import stringify from 'json-stringify-safe';
import {
  isText,
  type TDescendant,
  type TNodeOperation,
} from '@udecode/plate-common';
import invariant from 'tiny-invariant';
import * as Y from 'yjs';
import { SyncElement } from '../model';
import { toSlateNode, toSlatePath } from '../utils/convert';
import { MinimalRootEditor } from '@decipad/editor-types';

/**
 * Translates a Yjs array event into a slate operations.
 */
export default function translateArrayEvent(
  editor: MinimalRootEditor,
  event: Y.YArrayEvent<SyncElement>
): TNodeOperation[] {
  const targetPath = toSlatePath(event.path);
  const targetElement = editor.getNode(targetPath);
  if (!targetElement) return [];

  invariant(!isText(targetElement), 'Cannot apply array event to text node');

  let offset = 0;
  const ops: TNodeOperation[] = [];
  const children = Array.from(targetElement.children as TDescendant[]);

  event.changes.delta.forEach((delta) => {
    if ('retain' in delta) {
      offset += delta.retain ?? 0;
    }

    if ('delete' in delta) {
      const path = [...targetPath, offset];
      children.splice(offset, delta.delete ?? 0).forEach((node) => {
        ops.push({ type: 'remove_node', path, node });
      });
    }

    if ('insert' in delta) {
      invariant(
        Array.isArray(delta.insert),
        `Unexpected array insert content type: expected array, got ${stringify(
          delta.insert
        )}`
      );

      const toInsert = delta.insert.map(toSlateNode) as TDescendant[];

      toInsert.forEach((node, i) => {
        ops.push({
          type: 'insert_node',
          path: [...targetPath, offset + i],
          node,
        });
      });

      children.splice(offset, 0, ...toInsert);
      offset += delta.insert.length;
    }
  });

  return ops;
}
