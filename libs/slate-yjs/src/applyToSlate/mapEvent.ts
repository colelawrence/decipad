import { TNodeOperation } from '@udecode/plate';
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
  const targetElement = editor.editorController.GetNode(targetPath);
  const targetSyncElement = event.target as SyncElement;
  if (!targetElement) return [];

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
