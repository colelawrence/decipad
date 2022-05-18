import { getNode, TNodeOperation } from '@udecode/plate';
import * as Y from 'yjs';
import { YjsEditor } from '@decipad/slate-yjs';
import { SyncElement } from '../model';
import { toSlatePath } from '../utils/convert';

/**
 * Translates a Yjs map event into a slate operations.
 *
 * @param event
 */
export default function translateMapEvent(
  editor: YjsEditor,
  event: Y.YMapEvent<unknown>
): TNodeOperation[] {
  const targetPath = toSlatePath(event.path);
  const targetSyncElement = event.target as SyncElement;
  const targetElement = getNode(editor, targetPath);

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
