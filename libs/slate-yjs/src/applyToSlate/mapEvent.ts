import type { TNodeOperation } from '@udecode/plate-common';
import type * as Y from 'yjs';
import type { MinimalRootEditor } from '@decipad/editor-types';
import type { SyncElement } from '../model';
import { toSlatePath } from '../utils/convert';

/**
 * Translates a Yjs map event into a slate operations.
 *
 * @param event
 */
export default function translateMapEvent(
  editor: MinimalRootEditor,
  event: Y.YMapEvent<unknown>
): TNodeOperation[] {
  const targetPath = toSlatePath(event.path);
  const targetElement = editor.getNode(targetPath);
  if (!targetElement) return [];
  const targetSyncElement = event.target as SyncElement;

  const keyChanges = Array.from(event.changes.keys.entries());
  const newProperties = Object.fromEntries(
    keyChanges.map(([key, info]) => [
      key,
      info.action === 'delete' ? null : targetSyncElement.get(key),
    ])
  );

  const properties = Object.fromEntries(
    keyChanges.map(([key]) => [
      key,
      (targetElement as unknown as Record<string, unknown>)[key],
    ])
  );

  return [{ type: 'set_node', newProperties, properties, path: targetPath }];
}
