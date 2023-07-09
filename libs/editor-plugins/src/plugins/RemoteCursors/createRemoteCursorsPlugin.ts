import { MyEditor, MyPlatePlugin } from '@decipad/editor-types';
import { cursorStore } from '@decipad/react-contexts';
import { CursorEditor } from '@decipad/slate-yjs';
import { jsonify } from 'libs/slate-yjs/src/utils/jsonify';
import debounce from 'lodash.debounce';
import { cursorColor } from './cursorColor';

const RETRY_INTERVAL_MS = 1000;
const DEBOUNCE_MS = 1000;

const schedule = (_editor: MyEditor) => {
  setTimeout(() => {
    const editor = _editor as unknown as CursorEditor;
    if (!editor.awareness) {
      return schedule(_editor);
    }
    editor.awareness.on(
      'update',
      debounce(() => {
        const clientIds: Record<string, boolean> = {};

        const newCursorData = Array.from(editor.awareness.getStates())
          .filter(([clientId]) => {
            if (clientIds[clientId]) {
              return false;
            }

            clientIds[clientId] = true;

            return clientId !== editor.sharedType.doc?.clientID;
          })
          .map(([clientID, awareness]) => {
            const { anchor, focus } = awareness;
            const color = cursorColor(clientID);

            return {
              key: clientID,
              selection: {
                anchor,
                focus,
              },
              data: {
                ...jsonify(awareness),
                style: {
                  _backgroundColor: color,
                  backgroundColor: color.rgb,
                  width: 3,
                },
              },
            };
          })
          .filter(
            (cursor) => cursor.selection.anchor && cursor.selection.focus
          );

        cursorStore.set.cursors(newCursorData);
      }, DEBOUNCE_MS)
    );
  }, RETRY_INTERVAL_MS);
};

export const createRemoteCursorsPlugin = (): MyPlatePlugin => ({
  key: 'PLUGIN_REMOTE_CURSORS',
  then: schedule,
});
